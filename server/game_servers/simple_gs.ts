import { GameManager } from "../game_managers/gm_types";
import { GameId, UserToken } from "../shared_types";
import { GameState } from "./game_state";
import { ClientMsg, GameServer } from "./gs_types";
import { prototype, WebSocketServer } from "ws";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private gameState: GameState;
    private wss: WebSocketServer;
    private url: URL;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game serving running on port ${port}`));
        this.wss.on('connection', (ws, req) => {
            console.log('Receiving connection on game server!!!');
            ws.send('Hello from the game server itself!');
        });

        this.url = new URL('ws://localhost:8081');
    }

    createGame(id: GameId): Promise<boolean> {
        if (this.gameState !== undefined) {
            return Promise.resolve(false);
        }

        this.gameState = new GameState(id);
        return Promise.resolve(true);
    }

    getServerURL(): Promise<URL> {
        return Promise.resolve(this.url);
    }

    generateHostToken(id: GameId): Promise<UserToken> {
        if (this.gameState === undefined || this.gameState.gameId !== id) {
            return Promise.reject('Unknown game id');
        }

        return Promise.resolve(this.gameState.getHostUserToken());
    }

    generateUserToken(id: GameId): Promise<UserToken> {
        if (this.gameState === undefined || this.gameState.gameId !== id) {
            return Promise.reject('Unknown game id');
        }

        return Promise.resolve(this.gameState.addNewUser());
    }
}