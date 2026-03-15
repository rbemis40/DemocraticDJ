import WebSocket, { WebSocketServer } from "ws";
import { Game } from "./game.js";
import { ClientHandler } from "./client_handler.js";
import { PlayerFactoryI } from "./player_factory.js";

export class Server {
    private game: Game;
    private clientHandler: ClientHandler;
    private wss: WebSocketServer;

    constructor(port: number, game: Game, playerFactory: PlayerFactoryI) {
        this.game = game;
        this.clientHandler = new ClientHandler(this.game, playerFactory);

        this.wss = new WebSocketServer({port: port}, () => {
            console.log(`WebSocketServer running on port ${port}...`);
        });

        this.wss.on("connection", (clientWs: WebSocket) => this.onConnection(clientWs));
    }

    private onConnection(clientWs: WebSocket) {
        this.clientHandler.newClient(clientWs);
    }
}