import { WebSocket } from "ws";
import { GameMode, GameModeName } from "./game_mode";
import { ClientMsg, ConnectionMap, RemoveUser_ClientMsg } from "../game_servers/gs_types";
import { UserManager } from "../user_manager";

export class LobbyMode implements GameMode {
    getModeName(): GameModeName {
        return 'lobby';
    }

    handleClientMsg(msg: ClientMsg, clientWs: WebSocket, cons: ConnectionMap, um: UserManager): GameModeName {
        switch (msg.type) {
            case 'start_game':
                return 'voting';
            case 'remove_user':
                const rmvMsg = msg as RemoveUser_ClientMsg;
                // Check that the host is the one making this request
                const reqToken = cons.socketToToken.get(clientWs);
                const reqUserInfo = um.getUserInfoByToken(reqToken);
                
                if (!reqUserInfo.isHost) {
                    return; // Invalid operation for a non host
                }

                // Otherwise, find the user to remove and close the connection
                const rmvToken = um.getUserInfoByName(rmvMsg.user_name).token;
                const rmvWs = cons.tokenToSocket.get(rmvToken);
                rmvWs?.close();
                break;
            default:
                console.log('vvvv');
                console.log('Invalid msg in lobby mode:');
                console.log(msg);
                console.log('^^^^');
                break;
        }

        return 'lobby';
    }
}