import { GameId, UserToken } from "../shared_types";
import { randomBytes } from 'crypto';
import { UserInfo } from "./gs_types";
import { WebSocket } from "ws";

export class GameState {
    gameId: GameId;
    private tokenMap: Map<UserToken, UserInfo>;
    private nameMap: Map<string, UserInfo>;

    static tokenLen: number = 36;

    constructor(gameId?: GameId) {
        this.gameId = gameId;
        this.tokenMap = new Map();
        this.nameMap = new Map();
    }

    addNewUser(name: string): UserToken {
        let userToken: UserToken;
        do {
            userToken = randomBytes(GameState.tokenLen).toString('base64');
        } while (this.tokenMap.has(userToken)); // Generate until we get a unique token

        console.log('adding user with name ' + name);
        const userInfo: UserInfo = {
            name: name,
            token: userToken,
            authed: false,
            isHost: false
        };

        this.tokenMap.set(userToken, userInfo);
        this.nameMap.set(name, userInfo);
        return userToken;
    }

    addNewHost(): UserToken {
        const hostToken = this.addNewUser('host');
        this.tokenMap.get(hostToken).isHost = true;

        return hostToken;
    }

    removeUser(token: UserToken): boolean {
        const userInfo = this.tokenMap.get(token);
        if (userInfo === undefined) {
            return false;
        }

        this.tokenMap.delete(token);
        this.nameMap.delete(userInfo.name);

        return true;
    }

    getAuthedUserList(): string[] {
        return Array.from(this.nameMap.keys()).filter((name) => this.getUserInfoByName(name).authed); // Only return useres that have already authenticated with the server
    }

    getUserInfoByToken(token: UserToken): UserInfo | undefined {
        return this.tokenMap.get(token);
    }

    getUserInfoByName(name: string): UserInfo | undefined {
        return this.nameMap.get(name);
    }

    isValidToken(token: UserToken): boolean {
        return this.tokenMap.has(token);
    }
}