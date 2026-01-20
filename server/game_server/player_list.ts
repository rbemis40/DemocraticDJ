import { OutboundMsg, User } from "./user";

export class PlayerList {
    private players: Map<string | undefined, User>;
    constructor() {
        this.players = new Map<string | undefined, User>();
    }

    addPlayer(player: User) {
        this.players.set(player.username, player);
    }

    removePlayer(player: User) {
        this.players.delete(player.username);
    }

    broadcast(msg: OutboundMsg<object>) {
        this.players.forEach(player => player.sendMsg(msg))
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

    getUserByUsername(username: string): User | undefined {
        return this.players.get(username);
    }

    get numPlayers() {
        return this.players.size;
    }
}