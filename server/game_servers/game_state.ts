import { UserToken } from "../shared_types";
import { randomBytes } from 'crypto';

export class GameState {
    gameId: number;
    private hostToken: string;
    private users: Set<UserToken>;

    static tokenLen: number = 36;

    constructor(gameId) {
        this.gameId = gameId;
        this.hostToken = GameState.generateHostToken();
        this.users = new Set();
    }

    static generateHostToken(): UserToken {
        return randomBytes(GameState.tokenLen).toString('base64');
    }

    addNewUser(): UserToken {
        let userToken: UserToken;
        do {
            userToken = randomBytes(GameState.tokenLen).toString('base64');
        } while (this.users.has(userToken)); // Generate until we get a unique token

        this.users.add(userToken);
        return userToken;
    }

    getHostUserToken(): UserToken {
        return this.hostToken;
    }
}