import { GameManager } from "../game_managers/gm_types";
import { GameMode, GameModeName } from "../modes/game_mode";
import { LobbyMode } from "../modes/lobby_mode";
import { VotingMode } from "../modes/voting_mode";
import { GameId, UserToken } from "../shared_types";
import { UserManager } from "../user_manager";
import { ClientMsg, ConnectionMap, GameServer, ModeChange_ServerMsg, ServerMsg } from "./gs_types";
import { WebSocket, WebSocketServer } from "ws";

export interface Welcome_ServerMsg extends ServerMsg {
    type: 'welcome';
    role: 'player' | 'host';
    game_mode: GameModeName;
}

export interface UserJoin_ClientMsg extends ClientMsg {
    type: 'user_join';
    user_token: UserToken;
}

export interface UserLeft_ClientMsg extends ClientMsg {
    type: 'user_left';
    user_token: UserToken;   
}

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
                            this.curMode = new VotingMode(
                                this.userManager.getJoinedUserList(), 
                                (msg) => this.curMode.handleInternalMsg(msg, this.connections, this.userManager)
                            );
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

                userInfo.joined = false; // Mark the user as no longer connected. The user won't show up in userManager.getJoinedUserList()

                // Refire this event as user_leave client msg for the current mode to handle
                const userLeaveMsg: UserLeft_ClientMsg = {
                    type: 'user_left',
                    user_token: userInfo.token
                };
                this.curMode.handleClientMsg(userLeaveMsg, ws, this.connections, this.userManager);

                // NOTE: The user is removed from the user manager after the current mode handles the event,
                // since the current mode might need to access the user's info for cleanup.
                this.userManager.removeUser(token);

                if (userInfo.isHost) { // Close all connections
                    this.connections.socketToToken.forEach((_, otherWs) => otherWs.close());
                    return;
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
            case 'user_join': {
                const joinMsg = userMsg as UserJoin_ClientMsg;
                if (!this.userManager.isValidToken(joinMsg.user_token)) {
                    // If the token is not valid, close the connection because they are not a valid user
                    ws.close();
                }

                const userInfo = this.userManager.getUserInfoByToken(joinMsg.user_token);

                // Send a welcome message
                const welcomeMsg: Welcome_ServerMsg = {
                    type: 'welcome',
                    game_mode: this.curMode.getModeName(),
                    role: userInfo.isHost ? 'host' : 'player'
                }

                ws.send(JSON.stringify(welcomeMsg));

                
                // Mark this user as joined and add them to the list of known connections
                userInfo.joined = true;
                this.connections.socketToToken.set(ws, joinMsg.user_token);
                this.connections.tokenToSocket.set(joinMsg.user_token, ws);
                break;
            }
        }
    }
}