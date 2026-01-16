import { WebSocket } from "ws";

export type InGameInfo = {
    username?: string;
    isHost: boolean;
};

export type OutboundMsg<T extends object> = {
    action: string,
    data: T
};

export class User {
    username: string | undefined;
    isHost: boolean;
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    setInGameInfo(info: InGameInfo) {
        this.username = info.username;
        this.isHost = info.isHost;
    }

    sendMsg<T extends object>(msg: OutboundMsg<T>) {
        this.ws.send(JSON.stringify(msg));
    }

    disconnect() {
        this.ws.close();
    }
}
    