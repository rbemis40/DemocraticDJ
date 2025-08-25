export type UserToken = string;
export type GameId = number;

export type NewGameInfo = {
    host_token: UserToken,
    game_id: GameId,
    server_url: string
};