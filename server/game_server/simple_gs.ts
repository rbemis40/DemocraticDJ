import { RawData, WebSocketServer } from "ws";
import { TokenData, TokenHandler } from "../handlers/token_handler";
import { GameId } from "../shared_types";
import { Game } from "./game/game";
import { EventContext, GameServer, InternalDisconnectData, JoinData, joinDataSchema, NewPlayerData, spoitfySearchDataSchema, SpotifySearchData } from "./server_types";
import { InGameInfo, OutboundMsg, User } from "./user";
import { Validator } from "../handlers/validator";
import { Action, actionSchema, buildActionSchema } from "./action";
import { typeSafeBind } from "../utils";
import { EventProvider } from "./event_provider";
import { SpotifyManager, TrackInfo } from "../spotify/spotify_manager";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private wss: WebSocketServer;
    private url: URL;
    private game: Game;
    private validator: Validator<EventContext>;
    private eventProvider: EventProvider; // Used for internal dispatching of events from game modes
    private spotifyManager: SpotifyManager;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game server running on port ${port}`));
        this.url = new URL(`ws://${process.env.HOST_NAME}:8081`);
        this.eventProvider = new EventProvider();

        this.eventProvider.onAction((action) => { // Handle internally dispatched events
            this.validator.validateAndHandle(action, {
                user: null,
                eventProvider: this.eventProvider
            });
        });

        this.setupServerHandler();
    }

    async createGame(id: GameId, spotifyCode: string): Promise<boolean> {
        if (this.game !== undefined) {
            console.error(`Server is already running game with id ${this.game.id}`);
            return false;
        }

        this.game = new Game(id, this.eventProvider);
        this.spotifyManager = new SpotifyManager();
        if (process.env.SPOTIFY_REDIRECT_URI === undefined) {
            throw new Error("Missing environment variable 'SPOTIFY_REDIRECT_URI'!");
        }

        await this.spotifyManager.connect(spotifyCode, process.env.SPOTIFY_REDIRECT_URI);

        // Setup the actions that the game server itself handles
        this.validator = new Validator<EventContext>();
        this.validator.addPair({
            schema: buildActionSchema("player_join", joinDataSchema),
            handler: typeSafeBind(this.handleUserJoin, this)
        });

        this.validator.addPair({
            schema: buildActionSchema("internal_disconnect", {type: "object"}),
            handler: typeSafeBind(this.handleInternalDisconnect, this)
        });

        // Spotify Searching
        this.validator.addPair({
            schema: buildActionSchema("spotify_search", spoitfySearchDataSchema),
            handler: typeSafeBind(this.handleSearchQuery, this)
        });

        // All Actions are passed to the game to handle
        this.validator.addPair({
            schema: actionSchema,
            handler: typeSafeBind(this.game.handleAction, this.game)
        });

        return true;
    }

    async getServerURL(): Promise<URL> {
        return this.url;
    }

    private setupServerHandler() {
        this.wss.on('connection', (ws, req) => {
            const user = new User(ws); // We have a new connection, so create the new user
            ws.on('message', (data: RawData) => {
                try {
                    const msgObj = JSON.parse(data.toString());

                    console.log(`SimpleGameServer.setupServerHandler: Received msg: `);
                    console.log(msgObj);

                    // Pass the message to any game server handlers
                    this.validator.validateAndHandle(msgObj, {
                        user: user,
                        eventProvider: this.eventProvider
                    });
                }
                catch (e) {
                    console.error(e);
                }
            });

            ws.on('close', () => {
                // TODO
            });
        });
    }

    private handleUserJoin(joinAction: Action<JoinData>, eventContext: EventContext) {
        if (eventContext.user === null) {
            return; // Only handle external events
        }

        const joinData: JoinData = joinAction.data;
        const user = eventContext.user;
        try {
            const tokenData: TokenData = TokenHandler.exchangeToken(joinData.token);
            user.setInGameInfo(tokenData satisfies InGameInfo);
            
            if (user.isHost) {
                console.log('Added host!');
            }
            else {
                console.log(`Added player '${user.username}'`);
            }
            
            user.isVoter = this.game.getPlayerList().numPlayers === 1; // If the only other player is the host, make the new player the active voter (for now)

            // Send a welcome message to the new user, informing them of the current game mode
            const welcomeMsg = {
                action: 'welcome',
                data: {
                    role: user.isHost ? 'host' : 'player',
                    isVoter: user.isVoter,
                    gamemode: this.game.mode.getName()
                }
            };

            this.game.addPlayer(user); // Add the player to the game
            user.sendMsg(welcomeMsg);

        } catch (e) {
            console.error(e);
        }
    }

    private handleInternalDisconnect(internDiscAction: Action<InternalDisconnectData>, eventContext: EventContext) {
        console.log("HandleInternalDisconnect!");
        let user = internDiscAction.data.user as User;
        console.log(`Disconnecting user ${user.username}`);
        user.disconnect();

        this.game.removePlayer(user);
    }

    private async handleSearchQuery(searchAction: Action<SpotifySearchData>, eventContext: EventContext) {
        if (!eventContext.user || !eventContext.user.isVoter) {
            console.log(`Attempt to search by non-active user`);
            return; // Only allow the active voter to search for songs
        }
        const searchResults: TrackInfo[] = await this.spotifyManager.search(searchAction.data.query);
        eventContext.user?.sendMsg({
            action: "spotify_results",
            data: {
                results: searchResults
            }
        });
    }
}
