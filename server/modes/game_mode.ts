import { WebSocket } from "ws";
import { UserManager } from "../user_manager";
import { ClientMsg } from "../game_servers/client_types";
import { ConnectionMap, InternalMsg } from "../game_servers/server_types";

export type GameModeName = 'lobby' | 'voting';

export interface GameMode {
    handleClientMsg(msg: ClientMsg, clientWs: WebSocket, cons: ConnectionMap, um: UserManager): GameModeName;
    handleInternalMsg(msg: InternalMsg, cons: ConnectionMap, um: UserManager): GameModeName;
    getModeName(): GameModeName;
}