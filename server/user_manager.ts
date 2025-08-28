import { UserInfo } from "./game_servers/gs_types";
import { UserToken } from "./shared_types";
import { randomBytes } from 'crypto';

export class UserManager {
    private tokenMap: Map<UserToken, UserInfo>;
    private nameMap: Map<string, UserInfo>;

    static tokenLen: number = 36;

    constructor() {
        this.tokenMap = new Map();
        this.nameMap = new Map();
    }

    addNewUser(name?: string): UserToken {
        let userToken: UserToken;
        do {
            userToken = randomBytes(UserManager.tokenLen).toString('base64');
        } while (this.tokenMap.has(userToken)); // Generate until we get a unique token

        console.log('adding user with name ' + name);
        const userInfo: UserInfo = {
            name: name,
            token: userToken,
            joined: false,
            isHost: false
        };

        this.tokenMap.set(userToken, userInfo);
        this.nameMap.set(name, userInfo);
        return userToken;
    }

    addNewHost(): UserToken {
        const hostToken = this.addNewUser();
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

    getJoinedUserList(): string[] {
        return Array.from(this.nameMap.keys()).filter((name) => {
            const userInfo = this.getUserInfoByName(name);
            return userInfo.joined && !userInfo.isHost
        }); // Only return useres that have already authenticated with the server / joined, and exclude the host
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
