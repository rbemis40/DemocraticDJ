import { RawData, WebSocket } from "ws";
import { MessageHandler, Msg } from "../handlers/message_handler";
import { LeaveData } from "./server_types";

export type InGameInfo = {
    username?: string;
    isHost: boolean;
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

    sendMsg(msg: object) {
        this.ws.send(JSON.stringify(msg));
    }
}
    