import { UserToken } from "../shared_types";

export type ClientAction = 'start';

export type ClientMsg = {
    user_token: UserToken;
    action: ClientAction;
};

export type ServerMsgType = 'new_user' | 'user_left' | 'user_list';

export interface ServerMsg {
    type: ServerMsgType;
}

export interface UserChange_ServerMsg extends ServerMsg {
    type: 'new_user' | 'user_left';
    user_name: string;
}

export interface UserList_ServerMsg extends ServerMsg {
    type: 'user_list';
    user_names: string[];
}

export interface GameServer {
    handleConnect(clientWs: WebSocket);
    handleClientMsg(msg: ClientMsg);
    
}