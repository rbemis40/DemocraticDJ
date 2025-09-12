import { GameModeName } from "../modes/game_mode";

/* Client types */
export type ClientMsgType = 'user_join' | 'user_left' | 'joined_mode' | 'add_vote' | 'spotify_search' | 'spotify_queue';
export type ClientHostMsgType = 'remove_user' | 'start_game';

export interface ClientMsg {
    type: ClientMsgType | ClientHostMsgType;
}

export interface JoinedMode_ClientMsg extends ClientMsg {
    type: 'joined_mode';
    mode: GameModeName;
}

export interface SpotifySearch_ClientMsg extends ClientMsg {
    type: 'spotify_search';
    query: string;
}

export interface SpotifyQueue_ClientMsg extends ClientMsg {
    type: 'spotify_queue';
    track_uri: string;
}