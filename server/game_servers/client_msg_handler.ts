import { WebSocket } from "ws";
import { Auth_ClientMsg, ClientMsg, ConnectionMap, GameServer, RemoveUser_ClientMsg, ServerMsg, StateChange_ServerMsg, UserChange_ServerMsg, UserList_ServerMsg } from "./gs_types";
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
            case 'start_game':
                this.handleStartGame();
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
            user_names: this.gameState.getJoinedUserList()
        };

        ws.send(JSON.stringify(userListMsg));

        // Mark this user as joined and add them to the list of known connections
        this.gameState.getUserInfoByToken(authMsg.user_token).joined = true;
        this.connections.socketToToken.set(ws, authMsg.user_token);
        this.connections.tokenToSocket.set(authMsg.user_token, ws);


        // If it is the host, send a promotion message so the client knows they are the host
        if (this.gameState.getUserInfoByToken(authMsg.user_token).isHost) {
            const promotionMsg: ServerMsg = {
                type: 'promotion'
            };

            ws.send(JSON.stringify(promotionMsg));
        }        
        else { // Otherwise inform users that a new person has joined
            const userJoinMsg: UserChange_ServerMsg = {
                type: 'new_user',
                user_name: this.gameState.getUserInfoByToken(authMsg.user_token).name // TODO: Currently this fails if the user disconnects and reconnects using saved cookies
            };

            const userJoinMsgStr: string = JSON.stringify(userJoinMsg);
            this.connections.socketToToken.forEach((_, curWs) => curWs.send(userJoinMsgStr));        
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

    private handleStartGame() {
        // Enter the voting state
        const votingStateMsg: StateChange_ServerMsg = {
            type: 'state_change',
            state_name: 'voting'
        };

        const votingStateMsgStr = JSON.stringify(votingStateMsg);
        this.connections.tokenToSocket.forEach(curWs => curWs.send(votingStateMsgStr));
    }
}