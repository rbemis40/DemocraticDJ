import { GameId } from "./shared_types";

export interface ClusterCreateResponse {
    gameId: GameId;
    serverUrl: string;
    hostToken: string;
}

export interface ClusterJoinResponse {
    gameId: GameId;
    serverUrl: string;
    playerToken: string;
}