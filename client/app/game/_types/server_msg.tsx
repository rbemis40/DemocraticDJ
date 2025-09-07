export type ServerMsg = 
    WelcomeMsg
    | ModeChangeMsg
    | UserListMsg
    | VoteCountMsg
    | BeginCountdownMsg
    | EndCountdownMsg

export interface WelcomeMsg {
    type: 'welcome';
    game_mode: string;
    role: string;
};

export interface ModeChangeMsg {
    type: 'mode_change';
    game_mode: string;
};  

export interface UserListMsg {
    type: 'user_list';
    user_names: string[];
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