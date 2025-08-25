import { GameId, UserToken } from "../shared_types";

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
    generateUserToken(id: GameId): Promise<UserToken>;

    /* Methods for connecting new users */
    getServerURL(): Promise<URL>;
}