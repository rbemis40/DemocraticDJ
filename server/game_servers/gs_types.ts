import { GameId, UserToken } from "../shared_types";
import { WebSocket } from "ws";

/* Client types */
export type ClientAction = 'start';

export type ClientMsgType = 'auth';
export type ClientHostMsgType = 'remove_user' | 'start_game';

export interface ClientMsg {
    type: ClientMsgType | ClientHostMsgType;
}

export interface RemoveUser_ClientMsg {
    type: 'remove_user';
    user_name: string;
};

export interface Auth_ClientMsg extends ClientMsg {
    type: 'auth';
    user_token: UserToken;
}

/* Server types */
export type ServerMsgType = 'new_user' | 'user_left' | 'user_list' | 'promotion' | 'state_change';

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

export type StateName = 'lobby' | 'voting';
export interface StateChange_ServerMsg extends ServerMsg {
    type: 'state_change',
    state_name: StateName
};

/* Useful types */

/*
    1. User starts on democraticdj.com
    2. User clicks create game
    3. User is navigated to democraticdj.com/create
        a. The http server finds an available game server
        b. The http server creates an unused game id
        c. The http server uses createGame(id) to tell the server it is responsible for managing game with GameId id
        d. The http server uses generateHostToken to create a token on the gameserver that will authenticate the user as the host
        e. The http server uses getServerURL() to get the URL the user should use to connect to the server
    4. The user is returned a game_id, user_token (host token), and connection URL
    5. The user creates a web socket connection to 
*/
export interface GameServer {
    /* Initial setup of a new game */
    createGame(id: GameId): Promise<boolean>;
    generateHostToken(id: GameId): Promise<UserToken>;
    generateUserToken(id: GameId, name: string): Promise<UserToken>;

    /* Methods for connecting new users */
    getServerURL(): Promise<URL>;
}

export type UserInfo = {
    name?: string;
    token: UserToken;
    isHost: boolean;
    joined: boolean;
};

export type ConnectionMap = {
    socketToToken: Map<WebSocket, UserToken>;
    tokenToSocket: Map<UserToken, WebSocket>;
};