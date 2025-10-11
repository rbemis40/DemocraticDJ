import { RawData, WebSocketServer } from "ws";
import { MessageHandler, Msg } from "../handlers/message_handler";
import { TokenData, TokenHandler } from "../handlers/token_handler";
import { GameId } from "../shared_types";
import { Game } from "./game";
import { GameServer, JoinData, joinDataSchema, LeaveData, leaveDataSchema, NewPlayerData } from "./server_types";
import { InGameInfo, OutboundMsg, User } from "./user";

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

        this.msgHandler = new MessageHandler();
        this.game = new Game(id, this.msgHandler);

        this.msgHandler.defineAction('player_join', joinDataSchema);
        this.msgHandler.defineAction('player_leave', leaveDataSchema);

        // The arrow functions are necessary to preserve "this" binding
        this.msgHandler.on('player_join', (joinMsg: Msg<JoinData>, user) => this.handleUserJoin(joinMsg, user));
        this.msgHandler.on('player_leave', (joinMsg: Msg<LeaveData>, user) => this.handleUserLeave(joinMsg, user));

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

    private handleUserJoin(joinMsg: Msg<JoinData>, user: User) {
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

                this.game.players.forEach(player => {
                    player.sendMsg(newPlayerMsg);
                });
            }
            
            this.game.addPlayer(user); // Add the player to the game
        } catch (e) {
            console.error(e);
        }
    }

    private handleUserLeave(leaveMsg: Msg<LeaveData>, user: User) {
        this.game.removePlayer(user);
    }
}