import WebSocket from "ws";
import { Connection } from "./connection.js";
import { PlayerFactoryI } from "./player_factory.js";
import { Game } from "./game.js";
import { isAction } from "./action.js";
import { Player } from "./player.js";

export class ClientEventHandler {
    private game: Game;
    private playerFactory: PlayerFactoryI;

    constructor(game: Game, playerFactory: PlayerFactoryI) {
        this.game = game;
        this.playerFactory = playerFactory;
    }

    async newClient(clientWs: WebSocket) {
        const clientCon = new Connection(clientWs); // Handle socket-level logic
        const player = await this.playerFactory.createPlayer(clientCon); // Handles game-level logic
        this.game.addPlayer(player);

        // TODO: This should be abstracted away in the Connection class (ie clientCon.onAction)
        clientWs.on("message", (data: WebSocket.RawData) => this.onClientMsg(data, player));
        clientCon.onClientDisconnect(() => this.onClientDisconnect);
    }

    private onClientMsg(data: WebSocket.RawData, player: Player) {
        const dataStr = data.toString();
        console.log(dataStr);
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

    private onClientDisconnect(player: Player) {
        this.game.onPlayerDisconnect(player);
    }
 }