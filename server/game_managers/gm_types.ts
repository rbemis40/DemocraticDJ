import { Game } from "../game";
import { GameId, NewGameInfo } from "../shared_types";

export interface GameManager {
    generateNewGame(): Promise<NewGameInfo>;
    getGame(id: GameId): Promise<Game>;
};