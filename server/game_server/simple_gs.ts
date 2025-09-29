import { RawData, WebSocketServer } from "ws";
import { MessageHandler, Msg } from "../handlers/message_handler";
import { TokenData, TokenHandler } from "../handlers/token_handler";
import { GameId } from "../shared_types";
import { Game } from "./game";
import { GameServer, JoinData, joinDataSchema, LeaveData, leaveDataSchema, NewPlayerData } from "./server_types";
import { InGameInfo, OutboundMsg, User } from "./user";
import { addLobbyHandlers } from "../modes/lobby_mode";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private wss: WebSocketServer;
    private url: URL;
    private game: Game;
    private msgHandler: MessageHandler;

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
        this.msgHandler = new MessageHandler(this.game);

        this.msgHandler.defineAction('any', 'player_join', joinDataSchema);
        this.msgHandler.defineAction('any', 'player_leave', leaveDataSchema);

        this.msgHandler.on('any', 'player_join', this.handlerUserJoin);
        this.msgHandler.on('any', 'player_leave', this.handleUserLeave);

        // Add each mode's handlers
        addLobbyHandlers(this.msgHandler);

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
                    this.msgHandler.handle(data.toString(), user);
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

    private handlerUserJoin(joinMsg: Msg<JoinData>, user: User, game: Game) {
        const joinData = joinMsg.action.data;
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
                game_mode: game.mode,
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
                    game_mode: game.mode,
                    action: {
                        name: 'new_player',
                        data: {
                            username: tokenData.username
                        }
                    }
                }

                game.players.forEach(player => {
                    player.sendMsg(newPlayerMsg);
                });
            }
            
            game.addPlayer(user); // Add the player to the game
        } catch (e) {
            console.error(e);
        }
    }

    private handleUserLeave(leaveMsg: Msg<LeaveData>, user: User, game: Game) {
        game.removePlayer(user);
    }
}