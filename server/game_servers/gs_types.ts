import { GameMode, GameModeName } from "../modes/game_mode";
import { GameId, UserToken } from "../shared_types";
import { WebSocket } from "ws";

/* Client types */
export type ClientMsgType = 'user_join' | 'user_left' | 'joined_mode' | 'add_vote';
export type ClientHostMsgType = 'remove_user' | 'start_game';

export interface ClientMsg {
    type: ClientMsgType | ClientHostMsgType;
}

export interface JoinedMode_ClientMsg extends ClientMsg {
    type: 'joined_mode',
    mode: GameModeName
}

/* Server types */
export type ServerMsgType = 'user_list' | 'mode_change';
export interface ServerMsg {
    //type: ServerMsgType | ServerMsgVotingType;
    type: string;
}

export interface UserList_ServerMsg extends ServerMsg {
    type: 'user_list';
    user_names: string[];
}

export interface ModeChange_ServerMsg extends ServerMsg {
    type: 'mode_change';
    game_mode: GameModeName;
};

/* Internal Message Types */
export type InternalMsgType = string;
export interface InternalMsg {
    type: InternalMsgType 
}

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
    createGame(id: GameId, spotifyCode: string): Promise<boolean>;
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