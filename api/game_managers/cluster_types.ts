import { ClusterCreateResponse, ClusterJoinResponse } from "../../shared/responses";
import { GameId, UserInfo } from "../../shared/shared_types";

export interface Cluster {
    createGame(spotifyCode: string): Promise<ClusterCreateResponse>;
    joinGame(gameId: GameId, userInfo: UserInfo): Promise<ClusterJoinResponse>;
}