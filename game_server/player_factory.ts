import { Connection } from "./connection.js";
import Ajv, { JSONSchemaType } from "ajv";
import { TokenManager } from "../shared/tokens/token_manager.js";
import { PlayerTokenData } from "../shared/shared_types.js";
import { Player } from "./player.js";
import { IdProvider } from "./id_provider.js";

const ajv = new Ajv.Ajv();

interface PlayerJoinData {
    token: string;
}

const playerJoinSchema: JSONSchemaType<PlayerJoinData> = {
    type: "object",
    properties: {
        token: { type: "string" }
    },
    required: ["token"],
    additionalProperties: false
};

export interface PlayerFactoryI {
    createPlayer: (clientCon: Connection) => Promise<Player>;
}
export class PlayerFactory implements PlayerFactoryI {
    private tokenManager: TokenManager;
    private idProvider: IdProvider;

    constructor(tokenManager: TokenManager, idProvider: IdProvider) {
        this.tokenManager = tokenManager;
        this.idProvider = idProvider;
    }

    /**
     * Performs the handshake to create a new player
     */
    async createPlayer(clientCon: Connection): Promise<Player> {
        const curAction = await clientCon.waitForAction();
        if(!ajv.validate(playerJoinSchema, curAction.data)) {
            throw new Error("Handshake failed, invalid player_join action!");
        }

        const playerTokenData: PlayerTokenData | undefined = this.tokenManager.exchangeToken(curAction.data.token);
        if (playerTokenData === undefined) {
            throw new Error("Invalid player token!");
        }

        const newPlayer = new Player({
            isHost: playerTokenData.isHost,
            username: playerTokenData.username,
            isActiveVoter: false
        }, clientCon, this.idProvider.generateId());

        return newPlayer;
    }
}