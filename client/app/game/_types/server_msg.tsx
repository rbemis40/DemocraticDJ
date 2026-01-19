import { SpotifySearchResult } from "./spotify_types";

export type ServerMsg = {
    action: string,
    data: object
};

export interface WelcomeData {
    role: string;
    gamemode: string;
};

export interface ModeChangeData {
    gamemode: string;
};

export interface UserListData {
    user_list: string[];
};

export interface NewPlayerData {
    username: string;
};

/* Begin deprecated types */

export interface ModeChangeMsg {
    type: 'mode_change';
    game_mode: string;
};  

export interface VoteCountMsg {
    type: 'vote_count';
    count: {[name: string]: number};
};

export interface BeginCountdownMsg {
    type: 'begin_countdown';
    seconds: number;
};

export interface EndCountdownMsg {
    type: 'end_countdown';
};

export interface SpotifyResultsMsg {
    type: 'spotify_results';
    tracks: SpotifySearchResult[]
};