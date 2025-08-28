import { GameModeName } from "../modes/game_mode";
import { GameId, UserToken } from "../shared_types";
import { WebSocket } from "ws";

/* Client types */
export type ClientMsgType = 'auth' | 'add_vote';
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

export interface AddVote_ClientMsg extends ClientMsg {
    type: 'add_vote';
    user_name: string;    
}

/* Server types */
export type ServerMsgType = 'new_user' | 'user_left' | 'user_list' | 'promotion' | 'mode_change';
export type ServerMsgVotingType = 'vote_count';

export interface ServerMsg {
    type: ServerMsgType | ServerMsgVotingType;
}

export interface UserChange_ServerMsg extends ServerMsg {
    type: 'new_user' | 'user_left';
    user_name: string;
}

export interface UserList_ServerMsg extends ServerMsg {
    type: 'user_list';
    user_names: string[];
}

export interface ModeChange_ServerMsg extends ServerMsg {
    type: 'mode_change';
    game_mode: GameModeName;
};

/* Server Voting */
export interface VoteCount_ServerMsg extends ServerMsg {
    type: 'vote_count',
    count: {[name: string]: number}   
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