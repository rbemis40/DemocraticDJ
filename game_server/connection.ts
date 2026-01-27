import { WebSocket } from "ws";
import { Action } from "./action";

export class Connection {
    private ws: WebSocket;
    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    sendAction<T extends object>(msg: Action<T>) {
        this.ws.send(JSON.stringify(msg));
    }

    disconnect() {
        this.ws.close();
    }
}