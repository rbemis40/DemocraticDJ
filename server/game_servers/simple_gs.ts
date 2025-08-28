import { GameManager } from "../game_managers/gm_types";
import { GameMode } from "../modes/game_mode";
import { LobbyMode } from "../modes/lobby_mode";
import { GameId, UserToken } from "../shared_types";
import { UserManager } from "../user_manager";
import { VotingMode } from "../voting_mode";
import { Auth_ClientMsg, ClientMsg, ConnectionMap, GameServer, ModeChange_ServerMsg, RemoveUser_ClientMsg, ServerMsg, UserChange_ServerMsg, UserList_ServerMsg } from "./gs_types";
import { prototype, WebSocket, WebSocketServer } from "ws";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private userManager: UserManager;
    private wss: WebSocketServer;
    private url: URL;
    private connections: ConnectionMap;
    private gameId: GameId;
    private curMode: GameMode;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game serving running on port ${port}`));
        this.connections = {
            socketToToken: new Map(),
            tokenToSocket: new Map()
        };

        this.url = new URL(`ws://${process.env.HOST_NAME}:8081`);
        this.userManager = new UserManager();
        this.curMode = new LobbyMode();

        //const clientMsgHandler = new ClientMsgHandler(this.gameState, this.connections);

        this.wss.on('connection', (ws, req) => {
            ws.on('message', (data) => {
                // TODO: Don't assume that the client is sending a proper message
                const userMsg: ClientMsg = JSON.parse(data.toString());
                this.handleCommonClientMsg(userMsg, ws); // Handle messages that are present throughout the entire game (auth, leaving)
                const requestedMode = this.curMode.handleClientMsg(userMsg, ws, this.connections, this.userManager);
                if (requestedMode !== this.curMode.getModeName()) {
                    // We need to switch to a new mode
                    switch (requestedMode) {
                        case 'lobby':
                            this.curMode = new LobbyMode();
                            break;
                        case 'voting':
                            this.curMode = new VotingMode();
                            break;
                    }

                    // Inform the users
                    const modeChangeMsg: ModeChange_ServerMsg = {
                        type: 'mode_change',
                        game_mode: this.curMode.getModeName()
                    };

                    const modeChangeMsgStr = JSON.stringify(modeChangeMsg);
                    this.connections.tokenToSocket.forEach(curWs => curWs.send(modeChangeMsgStr));
                }
            });

            ws.on('close', () => {
                const token = this.connections.socketToToken.get(ws);
                const userInfo = this.userManager.getUserInfoByToken(token);

                // Remove the connection from the list of connections
                this.connections.socketToToken.delete(ws);
                this.connections.tokenToSocket.delete(token);
                this.userManager.removeUser(token);

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
        if (this.gameId !== undefined) {
            console.error(`Server is already running game with id ${this.gameId}`);
            return Promise.resolve(false);
        }

        this.gameId = id;
        return Promise.resolve(true);
    }

    getServerURL(): Promise<URL> {
        return Promise.resolve(this.url);
    }

    generateHostToken(id: GameId): Promise<UserToken> {
        if (this.gameId !== id) {
            return Promise.reject(`generateHostToken: Unknown game id ${id}`);
        }

         return Promise.resolve(this.userManager.addNewHost());
    }

    generateUserToken(id: GameId, name: string): Promise<UserToken> {
        if (this.gameId !== id) {
            return Promise.reject(`generateUserToken: Unknown game id ${id}`);
        }
        
        return Promise.resolve(this.userManager.addNewUser(name));
    }

    private handleCommonClientMsg(userMsg: ClientMsg, ws: WebSocket) {
        switch (userMsg.type) {
            case 'auth':
                const authMsg = userMsg as Auth_ClientMsg;
                if (!this.userManager.isValidToken(authMsg.user_token)) {
                    // If the token is not valid, close the connection because they are not a valid user
                    ws.close();
                }

                // Otherwise send the list of currently joined users
                const userListMsg: UserList_ServerMsg = {
                    type: 'user_list',
                    user_names: this.userManager.getJoinedUserList()
                };

                ws.send(JSON.stringify(userListMsg));

                
                // Mark this user as joined and add them to the list of known connections
                this.userManager.getUserInfoByToken(authMsg.user_token).joined = true;
                this.connections.socketToToken.set(ws, authMsg.user_token);
                this.connections.tokenToSocket.set(authMsg.user_token, ws);

                // If they are the host, send a promotion message
                if (this.userManager.getUserInfoByToken(authMsg.user_token).isHost) {
                    const promotionMsg: ServerMsg = {
                        type: 'promotion'
                    };

                    ws.send(JSON.stringify(promotionMsg));
                }
                else {
                    // Otherwise inform users that a new user has joined
                    const userJoinMsg: UserChange_ServerMsg = {
                        type: 'new_user',
                        user_name: this.userManager.getUserInfoByToken(authMsg.user_token).name // TODO: Currently this fails if the user disconnects and reconnects using saved cookies
                    };

                    const userJoinMsgStr: string = JSON.stringify(userJoinMsg);
                    this.connections.socketToToken.forEach((_, curWs) => curWs.send(userJoinMsgStr));   
                }
                break;
        }
    }
}