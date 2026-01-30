import { RawData, WebSocket, WebSocketServer } from "ws";
import { GameId } from "../shared/shared_types";
import { IncomingMessage } from "http";

/**
 * Forwards each connection to the proxy server to another WebSocketServer, allowing for games
 */
export class WSReverseProxy {
    private wss: WebSocketServer;
    
    private gameIdMap: Map<GameId, URL>;
    
    constructor() {
        this.gameIdMap = new Map();
    }

    listen(port: number) {
        this.wss = new WebSocketServer({
            port: port
        }, () => {
            console.log(`Proxy Server running on port ${port}`);
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
        const serverUrl = this.gameIdMap.get(gameId);
        if (serverUrl === undefined) {
            console.warn(`Unknown gameId: ${gameId}`);
            ws.close();
            return;
        }

        // Create a new connection to that server and add to the maps
        const newWs = new WebSocket(serverUrl);
        
        newWs.on("close", () => {
            ws.close(); // Close the other connection
        });

        ws.on("close", () => {
            newWs.close();
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

    /**
     * Instruct the proxy to forward all connections to game id to the server at the URL
     * @param gameId
     * @param url 
     */
    forward(gameId: GameId, url: URL): boolean {
        if (this.gameIdMap.has(gameId)) {
            return false;
        }

        this.gameIdMap.set(gameId, url);
        return true;
    }
}