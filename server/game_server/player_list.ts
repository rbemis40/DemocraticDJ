import { Action } from "./action";
import { Player } from "./player";

export class PlayerList {
    private players: Map<string | undefined, Player>;
    constructor() {
        this.players = new Map<string | undefined, Player>();
    }

    addPlayer(player: Player) {
        this.players.set(player.username, player);
    }

    removePlayer(player: Player) {
        this.players.delete(player.username);
    }

    broadcast(action: Action<object>) {
        this.players.forEach(player => player.getConnection().sendAction(action));
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

    getUserByUsername(username: string): Player | undefined {
        return this.players.get(username);
    }

    get numPlayers() {
        return this.players.size;
    }
}