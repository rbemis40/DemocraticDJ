import { GameManager } from "../game_managers/gm_types";
import { GameId, UserToken } from "../shared_types";
import { ClientMsgHandler } from "./client_msg_handler";
import { GameState } from "../states/game_state";
import { Auth_ClientMsg, ClientMsg, ConnectionMap, GameServer, ServerMsg, UserChange_ServerMsg, UserList_ServerMsg } from "./gs_types";
import { prototype, WebSocket, WebSocketServer } from "ws";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private gameState: GameState;
    private wss: WebSocketServer;
    private url: URL;
    private connections: ConnectionMap;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game serving running on port ${port}`));
        this.connections = {
            socketToToken: new Map(),
            tokenToSocket: new Map()
        };

        this.url = new URL(`ws://${process.env.HOST_NAME}:8081`);
        this.gameState = new GameState();

        const clientMsgHandler = new ClientMsgHandler(this.gameState, this.connections);

        this.wss.on('connection', (ws, req) => {
            ws.on('message', (data) => {
                // TODO: Don't assume that the client is sending a proper message
                const userMsg: ClientMsg = JSON.parse(data.toString());
                clientMsgHandler.handleClientMsg(userMsg, ws, );
            });

            ws.on('close', () => {
                // TODO: For now assume the host hasn't left. In the future, handle this case separately (disconnect all other clients)
                const token = this.connections.socketToToken.get(ws);
                const userInfo = this.gameState.getUserInfoByToken(token);

                // Remove the connection from the list of connections
                this.connections.socketToToken.delete(ws);
                this.connections.tokenToSocket.delete(token);
                this.gameState.removeUser(token);

                if (userInfo.isHost) {
                    // Close all connections
                    // TODO: Send a more graceful message so clients know that the host left

                    this.connections.socketToToken.forEach((_, otherWs) => otherWs.close());
                    return;
                }
                else {
                    const leftMsg: UserChange_ServerMsg = {
                        type: 'user_left',
                        user_name: userInfo.name
                    };

                    const leftMsgStr: string = JSON.stringify(leftMsg);

                    // Inform all other clients that the user left
                    this.connections.socketToToken.forEach((_, otherWs) => otherWs.send(leftMsgStr));
                }
            })
        });
    }

    createGame(id: GameId): Promise<boolean> {
        if (this.gameState.gameId !== undefined) {
            return Promise.resolve(false);
        }

        this.gameState.gameId = id;
        return Promise.resolve(true);
    }

    getServerURL(): Promise<URL> {
        return Promise.resolve(this.url);
    }

    generateHostToken(id: GameId): Promise<UserToken> {
        if (this.gameState.gameId !== id) {
            return Promise.reject(`generateHostToken: Unknown game id ${id}`);
        }

         return Promise.resolve(this.gameState.addNewHost());
    }

    generateUserToken(id: GameId, name: string): Promise<UserToken> {
        if (this.gameState.gameId !== id) {
            return Promise.reject(`generateUserToken: Unknown game id ${id}`);
        }
        
        return Promise.resolve(this.gameState.addNewUser(name));
    }
}