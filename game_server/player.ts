import { Connection } from "./connection.js";

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

export type PlayerId = string;

export class Player implements PlayerData {
    username?: string;
    isHost: boolean;
    isVoter: boolean;
    playerId: PlayerId;
    private con: Connection;

    constructor(info: InGameInfo, con: Connection, playerId: PlayerId) {
        this.con = con;
        this.username = info.username;
        this.isHost = info.isHost;
        this.isVoter = info.isActiveVoter;
        this.playerId = playerId;
    }
    
    getConnection(): Connection {
        return this.con;
    }
}
    