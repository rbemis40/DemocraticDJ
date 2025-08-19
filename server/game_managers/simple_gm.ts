import { Game } from '../game';
import { GameId, NewGameInfo } from '../shared_types';
import { GameManager } from './gm_types';

export class SimpleGameManager implements GameManager {
    activeGames: Map<GameId, Game>;
    constructor() {
        this.activeGames = new Map();
    }

    generateNewGame(): Promise<NewGameInfo> {
        // Generate a random 7 digit game id
        const MAX_GAME_ID = 9999999
        let gameId;
        do {
            gameId = Math.floor(Math.random() * MAX_GAME_ID);
        } while (this.activeGames.has(gameId)); // Continue generating until we create a new gameId
        
        const game = new Game(gameId);
        this.activeGames.set(gameId, game);

        return Promise.resolve({
            host_token: game.getHostUserToken(),
            game_id: game.gameId
        });
    }

    getGame(id: GameId): Promise<Game> {
        let game = this.activeGames.get(id);
        if (game === undefined) {
            return Promise.reject(`Failed to get game with id=${id}`);
        }

        return Promise.resolve(game);
    }
}