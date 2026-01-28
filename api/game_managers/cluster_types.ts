import { ClusterGameInfo, GameId, UserInfo } from "../../shared/shared_types";

export interface Cluster {
    createGame(spotifyCode: string): Promise<ClusterGameInfo>;
    joinGame(gameId: GameId, userInfo: UserInfo): Promise<string>;
}