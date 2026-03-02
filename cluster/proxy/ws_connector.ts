import { WebSocket } from "ws";

export class WebSocketConnector {
    private url: URL | string;
    private retryInterval: number;
    private maxRetries: number;
    
    constructor(url: URL | string, retryInterval: number=1000, maxRetries: number=5) {
        this.url = url;
        this.retryInterval = retryInterval;
        this.maxRetries = maxRetries;
    }

    async connect(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            let numTries = 1;
            const makeWs = () => {
                console.log(`Attempting to connect (${numTries}/${this.maxRetries})...`);
                const ws = new WebSocket(this.url);
                ws.onopen = () => {
                    ws.onerror = null;
                    resolve(ws);
                }

                ws.onerror = (err) => {
                    console.warn(`Failed to connect (${numTries}/${this.maxRetries})...`);
                    ws.close();
                    if (numTries < this.maxRetries) {
                        numTries += 1;
                        setTimeout(makeWs, this.retryInterval);
                    }
                    else {
                        reject(`Connection attempts exceeded max limit of ${this.maxRetries} tries`);
                    }
                }
            }
            
            makeWs();
        });
    }
}