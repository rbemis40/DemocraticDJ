import WebSocket from "ws";
import { Action, isAction } from "./action.js";

interface ConnectionOptions {
    pingInterval?: number;
}

const defaultOptions: ConnectionOptions = {
    pingInterval: 5000
}

export class Connection {
    private ws: WebSocket;
    private pingInterval: NodeJS.Timeout;
    private msgResolvers: ((msg: Action<object>) => void)[]; // TODO: Need to queue messages if there are no resolvers

    constructor(ws: WebSocket, options?: ConnectionOptions) {
        this.ws = ws;
        this.msgResolvers = [];

        this.ws.on("message", (data: WebSocket.RawData) => this.onMsg(data));
    
        this.pingInterval = setInterval(
            () => this.ping(),
            options?.pingInterval || defaultOptions.pingInterval
        );
    }

    sendObj(obj: object) {
        this.ws.send(JSON.stringify(obj));
    }

    sendStr(str: string) {
        this.ws.send(str);
    }

    waitForAction(): Promise<Action<object>> {
        return new Promise((resolve) => {
            this.msgResolvers.push(resolve);
        });
    }

    close() {
        clearInterval(this.pingInterval);
        this.ws.close();
    }

    private onMsg(data: WebSocket.RawData) {
        const dataStr = data.toString();
        try {
            const dataObj = JSON.parse(dataStr) as unknown;

            if (!isAction(dataObj)) {
                throw new Error("msg object must be a valid Action");
            }

            // Resolve all promises that are waiting on an action
            this.msgResolvers.forEach(resolve => resolve(dataObj));
            this.msgResolvers = [];
        }
        catch(err) {
            console.warn(err);
            // TODO: Send back an error 
        }
    }

    private ping() {
        console.log("Pinging ws..."); // TEMPORARY
    }
}