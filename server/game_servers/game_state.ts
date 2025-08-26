import { GameId, UserToken } from "../shared_types";
import { randomBytes } from 'crypto';
import { UserInfo } from "./gs_types";

export class GameState {
    gameId: GameId;
    private hostToken: string;
    private users: Map<UserToken, UserInfo>;

    static tokenLen: number = 36;

    constructor(gameId?: GameId) {
        this.gameId = gameId;
        this.hostToken = GameState.generateHostToken();
        this.users = new Map();
    }

    static generateHostToken(): UserToken {
        return randomBytes(GameState.tokenLen).toString('base64');
    }

    addNewUser(name: string): UserToken {
        let userToken: UserToken;
        do {
            userToken = randomBytes(GameState.tokenLen).toString('base64');
        } while (this.users.has(userToken)); // Generate until we get a unique token

        console.log('adding user with name ' + name);
        const userInfo: UserInfo = {
            name: name
        };

        this.users.set(userToken, userInfo);
        return userToken;
    }

    removeUser(token: UserToken): boolean {
        return this.users.delete(token);
    }

    getHostUserToken(): UserToken {
        return this.hostToken;
    }

    getUserList(): string[] {
        let names: string[] = [];
        this.users.forEach((curInfo) => names.push(curInfo.name));
        return names;
    }

    getUserInfo(token: UserToken): UserInfo | undefined {
        return this.users.get(token);
    }

    isValidToken(token: UserToken): boolean {
        return this.hostToken === token || this.users.has(token);
    }
}