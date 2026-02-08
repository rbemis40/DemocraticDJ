import { RawData, WebSocket, WebSocketServer } from "ws";
import { GameId } from "../shared/shared_types";
import { IncomingMessage } from "http";

interface ForwardingData {
    url: URL;
    sockets: Set<WebSocket>;
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
    
    constructor(port: number) {
        this.gameIdMap = new Map();
        this.port = port;
    }

    listen() {
        this.wss = new WebSocketServer({
            port: this.port
        }, () => {
            console.log(`Proxy Server running on port ${this.port}`);
        });

        this.wss.on("connection", (ws, req) => {
            this.handleClientConnect(ws, req);
        });
    }

    private handleClientConnect(ws: WebSocket, req: IncomingMessage) {
        if (req.url === undefined) {
            console.warn("User attempted to connect to proxy with no available URL!");
            ws.close();
            return;
        }

        console.log(`User connected using URL "${req.url}"`);
        const parsedUrl = URL.parse(req.url, "ws://127.0.0.1");
        if (parsedUrl === null) {
            console.warn(`Invalid URL used when connecting to proxy: "${req.url}"`);
            ws.close();
            return;
        }

        const gameIdStr = parsedUrl.searchParams.get("gameid");
        if (gameIdStr === null) {
            console.warn(`User attempted to connect without providing gameid param: "${req.url}"`);
            ws.close();
            return;
        }

        let gameId: number;
        try {
            gameId = Number.parseInt(gameIdStr, 10);
        }
        catch {
            console.warn(`GameId must be a number, got: ${gameIdStr}`);
            ws.close();
            return;
        }

        // With the gameId, look up if there is a server that correlates
        const forwardingData = this.gameIdMap.get(gameId);
        if (forwardingData === undefined) {
            console.warn(`Unknown gameId: ${gameId}`);
            ws.close();
            return;
        }

        // Create a new connection to that server and add to the maps
        const newWs = new WebSocket(forwardingData.url);
        
        // Add it to the map so they can be closed if the stopForwarding method is called
        forwardingData.sockets.add(newWs);
        forwardingData.sockets.add(ws);

        // When one closes, close the other socket in the pair, and remove both from the ForwardingData
        newWs.on("close", () => {
            ws.close();
            const forwardingData = this.gameIdMap.get(gameId);
            forwardingData?.sockets.delete(ws);
            forwardingData?.sockets.delete(newWs);
        });

        ws.on("close", () => {
            newWs.close();
            const forwardingData = this.gameIdMap.get(gameId);
            forwardingData?.sockets.delete(ws);
            forwardingData?.sockets.delete(newWs);
        });

        ws.on("message", (data) => this.forwardClientMsg(data, ws, newWs));
        newWs.on("message", (data) => this.forwardServerMsg(data, ws, newWs));

    }

    private forwardClientMsg(data: RawData, clientWs: WebSocket, serverWs: WebSocket) {
        serverWs.send(data);
    }

    private forwardServerMsg(data: RawData, clientWs: WebSocket, serverWs: WebSocket) {
        clientWs.send(data);
    }

    
    forward(gameId: GameId, url: URL): boolean {
        if (this.gameIdMap.has(gameId)) {
            return false;
        }

        this.gameIdMap.set(gameId, {
            url: url,
            sockets: new Set()
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
        return `ws://127.0.0.1:${this.port}`;
    }
}