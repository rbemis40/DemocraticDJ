import { WebSocket } from "ws";
import { Auth_ClientMsg, ClientMsg, ConnectionMap, GameServer, ServerMsg, UserChange_ServerMsg, UserList_ServerMsg } from "./gs_types";
import { GameState } from "./game_state";
import { UserToken } from "../shared_types";

export class ClientMsgHandler {
    private gameState: GameState;
    private connections: ConnectionMap;

    constructor(gameState: GameState, connections: ConnectionMap) {
        this.gameState = gameState;
        this.connections = connections;
    }

    handleClientMsg(userMsg: ClientMsg, ws: WebSocket) {
        switch (userMsg.type) {
            case 'auth':
                this.handleAuth(userMsg as Auth_ClientMsg, ws);
                break;
            case 'remove_user':
                this.handleRemoveUser(ws);
                break;
        }
    }

    private handleAuth(authMsg: Auth_ClientMsg, ws: WebSocket) {
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
        else {
            // If it is the host, send a promotion message
            const promotionMsg: ServerMsg = {
                type: 'promotion'
            };

            ws.send(JSON.stringify(promotionMsg));
        }
        
        // Finally add this connection to the list of known connections
        this.connections.set(ws, authMsg.user_token);
    }

    private removeUser(ws: WebSocket) {
        
    }
}