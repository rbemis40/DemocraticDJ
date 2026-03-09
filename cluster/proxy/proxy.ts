import { RawData, WebSocket, WebSocketServer } from "ws";
import { GameId } from "../../shared/shared_types";
import { IncomingMessage } from "http";
import { WebSocketConnector } from "./ws_connector";

interface ForwardingData {
    url: URL;
    sockets: Set<WebSocket>;
    clientMsgQueue: RawData[]; // Temporarily queues messages sent from the client until the connection to the server is established
}

export interface ProxyService {
    /**
     * Instruct the proxy to forward all connections to game id to the server at the URL
     * @param gameId
     * @param url 
     * @returns boolean - Returns true if successful, false if game id is already registered
     */
    forward(gameId: GameId, url: URL): boolean;

    /**
     * Removes the game id from the forwarding map and closes any connections that were using that game id.
     * @param gameId
     * @returns boolean - True if game id existed, false otherwise
     */
    stopForwarding(gameId: GameId): boolean;

    /**
     * @param gameId
     * @returns boolean - True if this game id is currently forwarding to a server, false otherwise 
     */
    isForwarding(gameId: GameId): boolean;

    /**
     * Returns the URL of the proxy service
     */
    getUrl(): string;
}

/**
 * Forwards each connection to the proxy server to another WebSocketServer, allowing for games
 */
export class WSReverseProxy implements ProxyService {
    private wss: WebSocketServer;
    private gameIdMap: Map<GameId, ForwardingData>;
    private port: number;
    private url: string;

    constructor(url: string, port: number) {
        this.gameIdMap = new Map();
        this.port = port;
        this.url = url;
    }

    listen() {
        this.wss = new WebSocketServer({
            port: this.port
        }, () => {
            console.log(`Proxy Server running on port ${this.port}`);
        });

        this.wss.on("connection", (ws, req) => {
            this.handleClientConnect(ws, req)
                .catch(err => {
                    console.warn(err);
                    ws.close();
                });
        });
    }

    private parseRequestURL(req: IncomingMessage): number | undefined {
        if (req.url === undefined) {
            console.warn("User attempted to connect to proxy with no available URL!");
            return;
        }

        console.log(`User connected using URL "${req.url}"`);
        const parsedUrl = URL.parse(req.url, "ws://127.0.0.1");
        if (parsedUrl === null) {
            console.warn(`Invalid URL used when connecting to proxy: "${req.url}"`);
            return;
        }

        const gameIdStr = parsedUrl.searchParams.get("gameid");
        if (gameIdStr === null) {
            console.warn(`User attempted to connect without providing gameid param: "${req.url}"`);
            return;
        }

        let gameId: number;
        try {
            gameId = Number.parseInt(gameIdStr, 10);
        }
        catch {
            console.warn(`GameId must be a number, got: ${gameIdStr}`);
            return;
        }

        return gameId;
    }

    /**
     * 
     * @param ws The client connection
     * @param req The request the client used to connect to the WebSocketServer. Provides the server's Game Id
     * @throws Error - If a connection to the corresponding game server fails (invalid Game Id or if the server is not ready)
     */
    private async handleClientConnect(ws: WebSocket, req: IncomingMessage) {
        const gameId = this.parseRequestURL(req);
        if (gameId === undefined) { // Check if it failed to parse
            throw new Error("Client connected to proxy with no gameId in request!");
        }

        // Look up if there is a server that correlates with this game id
        const forwardingData = this.gameIdMap.get(gameId);
        if (forwardingData === undefined) {
            throw new Error("Client provided an unknown gameId while connecting to proxy!");
        }

        const addToQueue = (data: RawData) => {
            forwardingData.clientMsgQueue.push(data);
        }

        ws.on("message", addToQueue); // Until the other half of the connection is established, add messages to a queue to be processed after

        // Create a new connection to that server and add to the maps
        const newWs = await new WebSocketConnector(forwardingData.url)
            .connect()
        
            // Now that the connection is open, stop adding to queue
        ws.on("message", (data) => {
            this.forwardClientMsg(data, ws, newWs);
        });
        ws.off("message", addToQueue); 

        ws.on("close", () => {
            newWs.close();
            const forwardingData = this.gameIdMap.get(gameId);
            forwardingData?.sockets.delete(ws);
            forwardingData?.sockets.delete(newWs);
        });

        newWs.on("close", () => {
            ws.close();
            const forwardingData = this.gameIdMap.get(gameId);
            forwardingData?.sockets.delete(ws);
            forwardingData?.sockets.delete(newWs);
        });

        newWs.on("message", (data) => this.forwardServerMsg(data, ws, newWs));

        // Work through the queue of messages that arrived before the server connection was open 
        forwardingData.clientMsgQueue.forEach(data => {
            this.forwardClientMsg(data, ws, newWs);
        });

        forwardingData.clientMsgQueue = []; // Clear the queue

        // Add it to the map so they can be closed if the stopForwarding method is called
        forwardingData.sockets.add(newWs);
        forwardingData.sockets.add(ws);
    }

    private forwardClientMsg(data: RawData, clientWs: WebSocket, serverWs: WebSocket) {
        if (serverWs.readyState !== WebSocket.OPEN){
            console.warn("Attempt to forward data to server before socket was ready");
            return;
        }

        //console.log("Forwarding to server:");
        //console.log(data.toString());

        serverWs.send(data);
    }

    private forwardServerMsg(data: RawData, clientWs: WebSocket, serverWs: WebSocket) {
        if (clientWs.readyState !== WebSocket.OPEN) {
            console.warn("Attempt to forward to client before socket was ready");
            return;
        }

        //console.log("Forwarding to client:");
        //console.log(data.toString());
        
        clientWs.send(data);
    }

    
    forward(gameId: GameId, url: URL): boolean {
        if (this.gameIdMap.has(gameId)) {
            return false;
        }

        this.gameIdMap.set(gameId, {
            url: url,
            sockets: new Set(),
            clientMsgQueue: []
        });
        return true;
    }

    stopForwarding(gameId: GameId): boolean {
        const forwardingData = this.gameIdMap.get(gameId);
        if (forwardingData === undefined) {
            return false;
        }

        // Close all of the connections
        forwardingData.sockets.forEach(socket => {
            socket.close();
        })

        // Remove from the game id map
        this.gameIdMap.delete(gameId);

        return true;
    }

    isForwarding(gameId: GameId): boolean {
        return this.gameIdMap.has(gameId);
    }

    getUrl(): string {
        return this.url;
    }
}