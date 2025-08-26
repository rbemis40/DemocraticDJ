import { WebSocket } from "ws";
import { Auth_ClientMsg, ClientMsg, ConnectionMap, GameServer, RemoveUser_ClientMsg, ServerMsg, UserChange_ServerMsg, UserList_ServerMsg } from "./gs_types";
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
                this.handleRemoveUser(userMsg as RemoveUser_ClientMsg, ws);
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
            user_names: this.gameState.getAuthedUserList()
        };

        ws.send(JSON.stringify(userListMsg));

        // Mark this user as authed and add them to the list of known connections
        this.gameState.getUserInfoByToken(authMsg.user_token).authed = true;
        this.connections.socketToToken.set(ws, authMsg.user_token);
        this.connections.tokenToSocket.set(authMsg.user_token, ws);

        // And now alert all users that there is a new user joining
        const userJoinMsg: UserChange_ServerMsg = {
            type: 'new_user',
            user_name: this.gameState.getUserInfoByToken(authMsg.user_token).name // TODO: Currently this fails if the user disconnects and reconnects using saved cookies
        };

        const userJoinMsgStr: string = JSON.stringify(userJoinMsg);
        this.connections.socketToToken.forEach((_, curWs) => curWs.send(userJoinMsgStr));        

        // If it is the host, send a promotion message
        if (this.gameState.getUserInfoByToken(authMsg.user_token).isHost) {
            const promotionMsg: ServerMsg = {
                type: 'promotion'
            };

            ws.send(JSON.stringify(promotionMsg));
        }
    }

    private handleRemoveUser(rmMsg: RemoveUser_ClientMsg, ws: WebSocket) {
        // This is a host only operation
        if (!this.gameState.getUserInfoByToken(this.connections.socketToToken.get(ws)).isHost) {
            return; // Invalid operation
        }

        // Find the socket we need to close
        const userInfo = this.gameState.getUserInfoByName(rmMsg.user_name);
        this.connections.tokenToSocket.get(userInfo.token).close(); // The onclose handler will deal with the business logic
    }
}