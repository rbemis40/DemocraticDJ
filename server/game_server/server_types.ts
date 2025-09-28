import { JSONSchemaType } from "ajv";
import { GameId, UserToken } from "../shared_types";

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

    /* Methods for connecting new users */
    getServerURL(): Promise<URL>;
}

/* Schema / msg types */
export type JoinData = {
    token: UserToken;
};

export const joinDataSchema: JSONSchemaType<JoinData> = {
    type: 'object',
    properties: {
        token: {type: 'string'}
    },

    required: ['token']
};

export type LeaveData = {};
export const leaveDataSchema: JSONSchemaType<LeaveData> = {
    type: 'object'
};