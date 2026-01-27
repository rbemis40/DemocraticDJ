import { Connection } from "./connection";

export type InGameInfo = {
    username?: string;
    isHost: boolean;
    isActiveVoter: boolean;
};

export interface PlayerData {
    username?: string;
    isHost: boolean;
    isVoter: boolean;
};

export class Player implements PlayerData {
    username?: string;
    isHost: boolean;
    isVoter: boolean;
    private con: Connection;

    constructor(info: InGameInfo, con: Connection) {
        this.con = con;
        this.username = info.username;
        this.isHost = info.isHost;
        this.isVoter = info.isActiveVoter;
    }
    
    getConnection(): Connection {
        return this.con;
    }
}
    