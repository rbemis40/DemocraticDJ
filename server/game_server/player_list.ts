import { OutboundMsg, User } from "./user";

export class PlayerList {
    private players: Set<User>;
    constructor() {
        this.players = new Set<User>();
    }

    addPlayer(player: User) {
        this.players.add(player);
    }

    removePlayer(player: User) {
        this.players.delete(player);
    }

    broadcast(msg: OutboundMsg<object>) {
        this.players.forEach(player => player.sendMsg(msg))
    }

    getUsernames(): string[] {
        const usernameList: string[] = [];
        this.players.forEach(player => {
            if (player.username) usernameList.push(player.username);
        });

        return usernameList;
    }
}