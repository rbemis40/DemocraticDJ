import { RawData, WebSocketServer } from "ws";
import { TokenData, TokenHandler } from "../handlers/token_handler";
import { GameId } from "../shared_types";
import { Game } from "./game/game";
import { GameServer, JoinData, joinDataSchema, LeaveData, leaveDataSchema, NewPlayerData } from "./server_types";
import { InGameInfo, OutboundMsg, User } from "./user";
import { Validator } from "../handlers/validator";
import { Action, actionSchema, buildActionSchema } from "./action";
import { typeSafeBind } from "../utils";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private wss: WebSocketServer;
    private url: URL;
    private game: Game;
    private validator: Validator<void, User>;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game serving running on port ${port}`));
        this.url = new URL(`ws://${process.env.HOST_NAME}:8081`);        

        this.setupServerHandler();
    }

    async createGame(id: GameId, spotifyCode: string): Promise<boolean> {
        if (this.game !== undefined) {
            console.error(`Server is already running game with id ${this.game.id}`);
            return false;
        }

        this.game = new Game(id);

        // Setup the actions that the game server itself handles
        this.validator = new Validator<void, User>();
        this.validator.addPair({
            schema: buildActionSchema("player_join", joinDataSchema),
            handler: typeSafeBind(this.handleUserJoin, this)
        });

        this.validator.addPair({
            schema: buildActionSchema("player_left", leaveDataSchema),
            handler: typeSafeBind(this.handleUserLeave, this)
        });

        // If the user sent an Action, pass it to the game to handle
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
            const user = new User(ws); // We have gotten a new connection, so create the new user
            ws.on('message', (data: RawData) => {
                try {
                    const msgObj = JSON.parse(data.toString());

                    console.log(msgObj);

                    // Pass the message to any game server handlers
                    this.validator.validateAndHandle(msgObj, user);
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

    private handleUserJoin(joinAction: Action<JoinData>, user: User) {
        const joinData: JoinData = joinAction.data;
        try {
            const tokenData: TokenData = TokenHandler.exchangeToken(joinData.token);
            user.setInGameInfo(tokenData as InGameInfo);
            
            if (user.isHost) {
                console.log('Added host!');
            }
            else {
                console.log(`Added player '${user.username}'`);
            }
            
            // Send a welcome message to the new user, informing them of the current game mode
            const welcomeMsg = {
                game_mode: this.game.mode.getName(),
                action: {
                    name: 'welcome',
                    data: {
                        role: user.isHost ? 'host' : 'player'
                    }
                }
            };

            user.sendMsg(welcomeMsg);

            if (!tokenData.isHost) { // Inform all other users that a new player has joined, unless it's the host
                const newPlayerMsg: OutboundMsg<NewPlayerData> = {
                    game_mode: this.game.mode.getName(),
                    action: {
                        name: 'new_player',
                        data: {
                            username: tokenData.username
                        }
                    }
                }

                this.game.getPlayerList().broadcast(newPlayerMsg);
            }
            
            this.game.addPlayer(user); // Add the player to the game
        } catch (e) {
            console.error(e);
        }
    }

    private handleUserLeave(leaveAction: Action<LeaveData>, user: User) {
        this.game.removePlayer(user);
    }
}