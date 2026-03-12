import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Game } from "./game.js";
import { ClientHandler } from "./client_handler.js";

class Server {
    private game: Game;
    private clientHandler: ClientHandler;
    private wss: WebSocketServer;

    constructor(port: number) {
        this.wss = new WebSocketServer({port: port}, () => {
            console.log(`WebSocketServer running on port ${port}...`);
        });

        this.wss.on("connection", this.onConnection);
    }

    private onConnection(clientWs: WebSocket) {
        this.clientHandler.newClient(clientWs)
    }
}