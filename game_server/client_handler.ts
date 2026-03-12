import WebSocket from "ws";
import { Connection } from "./connection.js";
import { createPlayer } from "./player_factory.js";
import { TokenManager } from "../shared/tokens/token_manager.js";
import { IdProvider } from "./id_provider.js";
import { Game } from "./game.js";
import { isAction } from "./action.js";
import { Player } from "./player.js";

export class ClientHandler {
    private game: Game;
    private tokenManager: TokenManager;
    private idProvider: IdProvider;

    constructor(game: Game, tokenManager: TokenManager, idProvider: IdProvider) {
        this.game = game;
        this.tokenManager = tokenManager;
        this.idProvider = idProvider;
    }

    async newClient(clientWs: WebSocket) {
        // Create a connection which handles socket-level logic, like pinging
        const clientCon = new Connection(clientWs);
        const player = await createPlayer(clientCon, this.tokenManager, this.idProvider);
        this.game.addPlayer(player);

        clientWs.on("message", (data: WebSocket.RawData) => this.onClientMsg(data, player))
        clientWs.on("close", () => this.onClientClose(player));
    }

    private onClientMsg(data: WebSocket.RawData, player: Player) {
        const dataStr = data.toString();
        try {
            const dataObj = JSON.parse(dataStr) as unknown;
            if(!isAction(dataObj)) {
                throw new Error(`Received invalid action from player`);
            }

            this.game.handlePlayerAction(dataObj, player);
        }
        catch (err) {
            console.warn(err);
            // TODO: Send an error for the malformed message
        }
    }

    private onClientClose(player: Player) {
        this.game.removePlayer(player);
    }
}