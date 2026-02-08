export type UserToken = string;

export type GameId = number;
export type NewGameInfo = {
    host_token: UserToken,
    game_id: GameId,
    server_url: string
};

export interface GameServer {
    /* Initial setup of a new game */
    connectSpotify(spotifyCode: string): Promise<boolean>;

    /* Methods for connecting new users */
    getServerURL(): Promise<URL>;
}

type HostTokenData = {
    isHost: true,
};

type UserTokenData = {
    isHost: false,
    username: string,
};

export type TokenData = HostTokenData | UserTokenData;

/**
 * Used when a new user is joining a game on a cluster
 */
export interface UserInfo {
    username?: string;
}


export interface PlayerTokenData {
    username?: string;
    isHost: boolean;
}