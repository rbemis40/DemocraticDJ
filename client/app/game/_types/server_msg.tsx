import { SpotifySearchResult } from "./spotify_types";

export type ServerMsg = {
    action: string,
    data: object
};

export interface WelcomeData {
    role: string;
    game_mode: string;
    player_name: string;
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

export interface ChangeVoterStateData {
    isVoter: boolean;
}

interface VoteInfo {
    username: string;
    choice?: SpotifySearchResult;
}

export interface VoterStateData {
    voters: VoteInfo[];
    timeRem: number;
    state: string;
}

export interface SongSelectedData {
    username: string;
    song_data: SpotifySearchResult;
}

export interface SongSelectOverData {
    state: string;
    timeRem: number;
}

export interface VoteCountData {
    count: {
        username: string;
        count: number;
    }[];
}

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