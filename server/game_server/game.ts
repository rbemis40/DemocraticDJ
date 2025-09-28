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
}