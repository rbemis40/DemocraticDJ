import { WebSocket } from "ws";
import { ClientMsg, ConnectionMap } from "../game_servers/gs_types";
import { UserManager } from "../user_manager";

export type GameModeName = 'lobby' | 'voting';

export interface GameMode {
    handleClientMsg(msg: ClientMsg, clientWs: WebSocket, cons: ConnectionMap, um: UserManager): GameModeName;
    getModeName(): GameModeName;
}