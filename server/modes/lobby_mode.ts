import { WebSocket } from "ws";
import { GameMode, GameModeName } from "./game_mode";
import { ConnectionMap, InternalMsg, UserList_ServerMsg } from "../game_servers/server_types";
import { UserManager } from "../user_manager";
import { ClientMsg, JoinedMode_ClientMsg } from "../game_servers/client_types";

interface RemoveUser_ClientMsg extends ClientMsg {
    type: 'remove_user',
    user_name: string
};

export class LobbyMode implements GameMode {
    getModeName(): GameModeName {
        return 'lobby';
    }

    handleClientMsg(msg: ClientMsg, clientWs: WebSocket, cons: ConnectionMap, um: UserManager): GameModeName {
        switch (msg.type) {
            case 'start_game':
                return 'voting';
            case 'user_left':
                this.sendUserList(um, cons);
                break;
            case 'remove_user':
                const rmvMsg = msg as RemoveUser_ClientMsg;
                // Check that the host is the one making this request
                const reqToken = cons.socketToToken.get(clientWs);
                const reqUserInfo = um.getUserInfoByToken(reqToken);
                
                if (!reqUserInfo.isHost) {
                    console.log('Invalid attempt to remove user as non-host!');
                    return; // Invalid operation for a non host
                }

                // Otherwise, find the user to remove and close the connection
                const rmvToken = um.getUserInfoByName(rmvMsg.user_name).token;
                const rmvWs = cons.tokenToSocket.get(rmvToken);
                rmvWs?.close();
                break;
            case 'joined_mode':
                const mdChng = msg as JoinedMode_ClientMsg;
                if (mdChng.mode === this.getModeName()) {
                    // A user has joined, so send the updated list
                    this.sendUserList(um, cons);
                }
                break;
            default:
                console.log('vvvv');
                console.log('Invalid msg in lobby mode:');
                console.log(msg);
                console.log('^^^^');
                break;
        }

        return this.getModeName();
    }

    handleInternalMsg(msg: InternalMsg, cons: ConnectionMap, um: UserManager): GameModeName {
        return this.getModeName();
    }

    private sendUserList(um: UserManager, cons: ConnectionMap) {
        const usrListMsg: UserList_ServerMsg = {
            type: 'user_list',
            user_names: um.getJoinedUserList()
        };

        const usrListMsgStr = JSON.stringify(usrListMsg);
        cons.tokenToSocket.forEach(curWs => curWs.send(usrListMsgStr));
    }
}