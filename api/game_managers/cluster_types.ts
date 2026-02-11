import { ClusterCreateResponse, ClusterJoinResponse } from "../../shared/responses";
import { GameId, UserInfo } from "../../shared/shared_types";

export type ServiceName = "spotify"; // | "apple";

export interface SpotifyServiceInfo {
    name: "spotify";
};

export type MusicServiceInfo = SpotifyServiceInfo;

export interface Cluster {
    createGame(musicService: MusicServiceInfo): Promise<ClusterCreateResponse>;
    joinGame(gameId: GameId, userInfo: UserInfo): Promise<ClusterJoinResponse>;
}