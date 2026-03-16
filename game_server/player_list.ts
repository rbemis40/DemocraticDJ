import { Validator } from "./handlers/validator.js";
import { GMEventContext } from "./modes/game_mode.js";
import { Action, buildActionSchema } from "./action.js";
import { EventProvider } from "./event_provider.js";
import { Player, PlayerId } from "./player.js";
import { PlayerLeaveData, playerLeaveDataSchema } from "./server_types.js";

export class PlayerList {
    private players: Map<PlayerId, Player>;
    private takenUsernames: Set<string | undefined>;

    constructor() {
        this.players = new Map();
        this.takenUsernames = new Set();
    }

    addPlayer(player: Player) {
        if (this.players.has(player.playerId)) {
            throw new Error("Player id is already taken");
        }

        if (this.takenUsernames.has(player.username)) {
            throw new Error("Username is already taken");
        }

        this.players.set(player.playerId, player);
        this.takenUsernames.add(player.username);
    }

    removePlayer(playerId: PlayerId) {
        const player = this.players.get(playerId);
        if (player !== undefined) {
            this.players.delete(player.playerId);
            this.takenUsernames.delete(player.username);
        }
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

    getPlayerById(playerId: PlayerId): Player | undefined {
        return this.players.get(playerId);
    }

    isUsernameTaken(username: string): boolean {
        return this.takenUsernames.has(username);
    }

    all(): Player[] {
        return Array.from(this.players.values());
    }

    get numPlayers() {
        return this.players.size;
    }
}