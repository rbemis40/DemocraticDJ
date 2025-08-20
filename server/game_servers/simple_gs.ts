import { GameManager } from "../game_managers/gm_types";
import { GameId } from "../shared_types";
import { ClientMsg, GameServer } from "./gs_types";
import { WebSocketServer } from "ws";


class SimpleGameServer implements GameServer {
    private gm: GameManager;
    private gameId: GameId;
    private wss: WebSocketServer;

    constructor(gm: GameManager, gameId: GameId) {
        this.gm = gm;
        this.gameId = gameId;
        this.wss = new WebSocketServer()
    }

    handleConnect(clientWs: WebSocket) {

    }

    handleClientMsg(msg: ClientMsg) {
        
    }
}