import { JSONSchemaType } from "ajv";
import { GameId, UserToken } from "../shared/shared_types";
import { Player } from "./player";
import { EventProvider } from "./event_provider";
import { SpotifyAPI } from "./spotify/spotify_api";
import { GMEventContext } from "./modes/game_mode";

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


export interface ExternalEventContext {
    user: Player;
    eventProvider: EventProvider<GMEventContext>;
    songManager: SpotifyAPI;
};

export interface InternalEventContext {
    user: null;
    eventProvider: EventProvider<GMEventContext>;
    songManager: SpotifyAPI;
};

export type EventContext = ExternalEventContext | InternalEventContext;

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

export type PlayerLeaveData = {
    player: object; // Should be User, but for now object until User has a defined schema
};
export const playerLeaveDataSchema: JSONSchemaType<PlayerLeaveData> = {
    type: 'object',
    properties: {
        player: {type: "object"}
    },

    required: ['player']
};


export type UserListData = {
    user_list: string[];
};
export const userListDataSchema: JSONSchemaType<UserListData> = {
    type: 'object',
    properties: {
        user_list: {
            type: 'array',
            items: {type: 'string'}
        }
    },
    required: ['user_list']
}

export type NewPlayerData = {
    username: string;
};
export const newPlayerDataSchema: JSONSchemaType<NewPlayerData> = {
    type: 'object',
    properties: {
        username: {type: 'string'}
    },
    required: ['username']
};