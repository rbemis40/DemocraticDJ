import { RawData, WebSocketServer } from "ws";
import { GameId } from "../shared_types";
import { Game } from "./game/game";
import { EventContext, GameServer, InternalDisconnectData, JoinData, joinDataSchema, NewPlayerData, spoitfySearchDataSchema, SpotifySearchData } from "./server_types";
import { Player, PlayerData } from "./player";
import { Validator } from "../handlers/validator";
import { Action, actionSchema, buildActionSchema } from "./action";
import { typeSafeBind } from "../utils";
import { EventProvider } from "./event_provider";
import { SpotifyManager, TrackInfo } from "../spotify/spotify_manager";
import { ServerContext } from "../modes/game_mode";
import { ConnectionHandler } from "./connection_handler";
import { Connection } from "./connection";
import { PlayerList } from "./player_list";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private wss: WebSocketServer;
    private url: URL;
    private game: Game;
    private validator: Validator<ServerContext>;
    private connectionHandler: ConnectionHandler;
    private playerList: PlayerList;
    private eventProvider: EventProvider<ServerContext>; // Used for internal dispatching of events from game modes
    private spotifyManager: SpotifyManager;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game server running on port ${port}`));
        this.url = new URL(`ws://${process.env.HOST_NAME}:8081`);
        this.eventProvider = new EventProvider();
        this.connectionHandler = new ConnectionHandler(this.eventProvider);
        this.playerList = new PlayerList();

        this.eventProvider.onAction((action, context) => { // Handle internally dispatched events
            this.validator.validateAndHandle(action, context);
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
        this.validator = new Validator();

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
        this.wss.on('connection', async (ws, req) => {
            const newCon = new Connection(ws);
            let player: Player | undefined = undefined;
            ws.on('message', (data: RawData) => {
                try {
                    const msgObj = JSON.parse(data.toString());

                    console.log(`SimpleGameServer.setupServerHandler: Received msg: `);
                    console.log(msgObj);

                    // Pass the message to any game server handlers
                    this.eventProvider.dispatchAction(msgObj, {
                        sender: {
                            con: newCon,
                            playerData: player
                        },
                        allPlayers: this.playerList,
                        eventProvider: this.eventProvider,
                        songManager: this.spotifyManager,
                        gameModeName: this.game.mode.getName()
                    });
                }
                catch (e) {
                    console.error(e);
                }
            });

            ws.on('close', () => {
                // TODO
            });

            player = await this.connectionHandler.completeHandshake(newCon); // Complete the handshake sequence with the new connection
            this.playerList.addPlayer(player);
        });
    }

    private handleUserJoin(joinAction: Action<JoinData>, eventContext: EventContext) {
        if (eventContext.user === null) {
            return; // Only handle external events
        }

        
    }

    private handleInternalDisconnect(internDiscAction: Action<InternalDisconnectData>, eventContext: ServerContext) {
        console.log("HandleInternalDisconnect!");
        let user = internDiscAction.data.user as Player;
        console.log(`Disconnecting user ${user.username}`);
        user.getConnection().disconnect();

        this.game.removePlayer(user);
    }

    private async handleSearchQuery(searchAction: Action<SpotifySearchData>, serverContext: ServerContext) {
        if (!serverContext.sender?.playerData?.isVoter) {
            console.log(`Attempt to search by non-active user`);
            return; // Only allow the active voter to search for songs
        }
        const searchResults: TrackInfo[] = await this.spotifyManager.search(searchAction.data.query);
        serverContext.sender.con.sendAction({
            action: "spotify_results",
            data: {
                results: searchResults
            }
        });
    }
}
