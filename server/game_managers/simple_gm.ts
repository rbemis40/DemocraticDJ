import { GameServer } from '../game_servers/gs_types';
import { GameId, NewGameInfo } from '../shared_types';
import { GameManager } from './gm_types';

/*
    The simple game manager only handles a single GameServer, avoiding load balancing
*/
export class SimpleGameManager implements GameManager {
    gameMap: Map<GameId, GameServer>;
    gameServers: GameServer[];

    constructor() {
        this.gameMap = new Map();
        this.gameServers = [];
    }

    generateNewGame(spotifyCode: string): Promise<GameId> {
        // Generate a random 7 digit game id
        const MAX_GAME_ID = 9999999;
        let gameId;
        do {
            gameId = Math.floor(Math.random() * MAX_GAME_ID);
        } while (this.gameMap.has(gameId)); // Continue generating until we create a new gameId
        
        if (this.gameServers.length < 1) {
            return Promise.reject('No available game server');
        }

        this.gameMap.set(gameId, this.gameServers[0]);
        this.gameServers[0].createGame(gameId, spotifyCode);

        return Promise.resolve(gameId);
    }

    addGameServer(gs: GameServer): boolean {
        if (this.gameServers.length !== 0) {
            return false;
        }

        this.gameServers.push(gs);
        return true;
    }

    getServerByGameId(id: GameId): Promise<GameServer> {
        const gs = this.gameMap.get(id);
        if (gs === undefined) {
            return Promise.reject(`getServerByGameId: Unknown game id ${id}`);
        }

        return Promise.resolve(gs);
    }
}