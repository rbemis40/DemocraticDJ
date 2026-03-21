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
    private wsCloseHandler: () => void;
    private discCallback: () => void;

    constructor(ws: WebSocket, options?: ConnectionOptions) {
        this.ws = ws;
        this.msgResolvers = [];
 
        this.pingInterval = setInterval(
            () => this.ping(),
            options?.pingInterval || defaultOptions.pingInterval
        );

        this.discCallback = () => {};
        this.wsCloseHandler = () => {
            this.cleanup();
            this.discCallback();
        };

        this.ws.on("message", (data: WebSocket.RawData) => this.onMsg(data));
        this.ws.on("close", this.wsCloseHandler);
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
        this.cleanup();
        this.ws.off("close", this.wsCloseHandler); // Deregister the callback, so that the natural disconnect handler is not fired
        this.ws.close();
    }

    onClientDisconnect(callback: () => void) {
        this.discCallback = callback;
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
        //console.log("Pinging ws..."); // TEMPORARY
    }

    private cleanup() {
        clearInterval(this.pingInterval);
    }
}