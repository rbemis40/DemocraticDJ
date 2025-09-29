import { GameId } from "../shared_types";
import { User } from "./user";

type Mode = 'lobby' | 'voting';

export class Game {
    id: GameId;
    players: Set<User>;
    mode: Mode;

    constructor(id: GameId) {
        this.id = id;
        this.players = new Set();
        this.mode = 'lobby';
    }

    addPlayer(player: User) {
        this.players.add(player);
    }

    removePlayer(player: User) {
        this.players.delete(player);
    }

    setMode(mode: Mode) {
        this.mode = mode;
    }

    getUserList(): string[] {
        return Array.from(this.players).reduce((userList: string[], user) => {
            if(user.username !== undefined) {userList.push(user.username);}
            return userList;
        }, [])
    }
}