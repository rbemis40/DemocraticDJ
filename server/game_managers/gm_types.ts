import { GameServer } from "../../shared/shared_types";
import { GameId } from "../shared_types";

/*
    Responsible for creating new unique GameIds and choosing which game server will be used to host each new game
*/
export interface GameManager {
    generateNewGame(spotifyCode: string): Promise<GameId>;
    getServerByGameId(id: GameId): Promise<GameServer>;
    addGameServer(gs: GameServer): boolean;
};