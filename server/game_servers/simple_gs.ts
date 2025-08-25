import { GameManager } from "../game_managers/gm_types";
import { GameId, UserToken } from "../shared_types";
import { GameState } from "./game_state";
import { Auth_ClientMsg, ClientMsg, GameServer, UserChange_ServerMsg, UserList_ServerMsg } from "./gs_types";
import { prototype, WebSocket, WebSocketServer } from "ws";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private gameState: GameState;
    private wss: WebSocketServer;
    private url: URL;
    private connections: Map<WebSocket, UserToken>;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game serving running on port ${port}`));
        this.connections = new Map();

        this.wss.on('connection', (ws, req) => {
            ws.on('message', (data) => {
                // TODO: Don't assume that the client is sending a proper message
                const userMsg: ClientMsg = JSON.parse(data.toString());
                switch (userMsg.type) {
                    case 'auth':
                        const authMsg = userMsg as Auth_ClientMsg;
                        console.log(authMsg);
                        if (!this.gameState.isValidToken(authMsg.user_token)) {
                            ws.close(); // This is not a valid user
                        }

                        // Otherwise, send this user the list of currently joined users
                        const userListMsg: UserList_ServerMsg = {
                            type: 'user_list',
                            user_names: this.gameState.getUserList()
                        };

                        ws.send(JSON.stringify(userListMsg));

                        // And now alert any other joined users that there is a new user joining (unless it's a host)
                        if (authMsg.user_token !== this.gameState.getHostUserToken()) {
                            const userJoinMsg: UserChange_ServerMsg = {
                                type: 'new_user',
                                user_name: this.gameState.getUserInfo(authMsg.user_token).name // TODO: Currently this fails if the user disconnects and reconnects using saved cookies
                            };

                            const userJoinMsgStr: string = JSON.stringify(userJoinMsg);
                            this.connections.forEach((_, otherWs) => otherWs.send(userJoinMsgStr));
                        }
                        
                        // Finally add this connection to the list of known connections
                        this.connections.set(ws, authMsg.user_token);
                        break;
                }
            })

            ws.on('close', () => {
                // TODO: For now assume the host hasn't left. In the future, handle this case separately (disconnect all other clients)
                const token = this.connections.get(ws);
                const userInfo = this.gameState.getUserInfo(token);

                // Remove the connection from the list of connections
                this.connections.delete(ws);
                this.gameState.removeUser(token);

                if (token == this.gameState.getHostUserToken()) {
                    // Close all connections
                    // TODO: Send a more graceful message so clients know that the host left

                    this.connections.forEach((_, otherWs) => otherWs.close());
                    return;
                }


                const leftMsg: UserChange_ServerMsg = {
                    type: 'user_left',
                    user_name: userInfo.name
                };

                const leftMsgStr: string = JSON.stringify(leftMsg);

                // Inform all other clients that the user left
                this.connections.forEach((_, otherWs) => otherWs.send(leftMsgStr));
            })
        });

        this.url = new URL('ws://localhost:8081');
    }

    createGame(id: GameId): Promise<boolean> {
        if (this.gameState !== undefined) {
            return Promise.resolve(false);
        }

        this.gameState = new GameState(id);
        return Promise.resolve(true);
    }

    getServerURL(): Promise<URL> {
        return Promise.resolve(this.url);
    }

    generateHostToken(id: GameId): Promise<UserToken> {
        if (this.gameState === undefined || this.gameState.gameId !== id) {
            return Promise.reject(`generateHostToken: Unknown game id ${id}`);
        }

        return Promise.resolve(this.gameState.getHostUserToken());
    }

    generateUserToken(id: GameId, name: string): Promise<UserToken> {
        if (this.gameState === undefined || this.gameState.gameId !== id) {
            return Promise.reject(`generateUserToken: Unknown game id ${id}`);
        }
        
        return Promise.resolve(this.gameState.addNewUser(name));
    }
}