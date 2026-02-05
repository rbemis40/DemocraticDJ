import { GameId } from "../../shared/shared_types";

export interface ContainerService {
    /**
     * Starts a game container with the appropriate game id
     * @param gameId 
     * @param gameServerImgName
     * @returns number - The port that the game server was started on
     */
    startContainer(gameId: GameId, gameServerImgName: string): Promise<number>;
}