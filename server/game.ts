import { UserToken } from "./shared_types";
import { randomBytes } from 'crypto';

export class Game {
    gameId: number;
    private hostToken: string;
    private users: Set<UserToken>;

    constructor(gameId) {
        this.gameId = gameId;
        this.hostToken = Game.generateHostToken();
        this.users = new Set();
    }

    static generateHostToken(): UserToken {
        return randomBytes(36).toString('base64');
    }

    addNewUser(): UserToken {
        let userToken: UserToken;
        do {
            userToken = randomBytes(36).toString('base64');
        } while (this.users.has(userToken)); // Generate until we get a unique token

        this.users.add(userToken);
        return userToken;
    }

    getHostUserToken(): UserToken {
        return this.hostToken;
    }
}