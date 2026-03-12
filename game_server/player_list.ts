import { Validator } from "./handlers/validator.js";
import { GMEventContext } from "./modes/game_mode.js";
import { Action, buildActionSchema } from "./action.js";
import { EventProvider } from "./event_provider.js";
import { Player } from "./player.js";
import { PlayerLeaveData, playerLeaveDataSchema } from "./server_types.js";

export class PlayerList {
    private players: Map<string | undefined, Player>;

    constructor() {
        this.players = new Map<string | undefined, Player>();
    }

    addPlayer(player: Player) {
        if (this.players.has(player.username)) {
            throw new Error(`Attempt to add duplicate username "${player.username}"`);
        }

        this.players.set(player.username, player);
    }

    removePlayer(player: Player) {
        this.players.delete(player.username);
    }

    broadcast(action: Action<object>) {
        this.players.forEach(player => player.getConnection().sendObj(action));
    }

    getUsernames(): string[] {
        const usernameArray: string[] = [];
        this.players.forEach(player => {
            if (player.username !== undefined) {
                usernameArray.push(player.username)
            }
        })

        return usernameArray
    }

    getPlayerByUsername(username: string): Player | undefined {
        return this.players.get(username);
    }

    getHost(): Player | undefined {
        return this.players.get(undefined);
    }

    isUsernameTaken(username: string): boolean {
        return this.players.has(username);
    }

    getPlayerById(id: string) {
        
    }

    get numPlayers() {
        return this.players.size;
    }
}