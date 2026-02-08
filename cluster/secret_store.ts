import { GameId } from "../shared/shared_types";
import { randomBytes } from "crypto";

export class SecretStore {
    private gameIdToSecret: Map<GameId, string>;
    
    constructor() {
        this.gameIdToSecret = new Map();
    }

    generateNewSecret(gameId: GameId, bits: number) {
        this.gameIdToSecret.set(gameId, randomBytes(bits).toString("base64"));
    }

    getSecret(gameId: GameId): string | undefined {
        return this.gameIdToSecret.get(gameId);
    }
}