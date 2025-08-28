import { WebSocket } from "ws";
import { GameMode, GameModeName } from "./modes/game_mode";
import { ClientMsg, ConnectionMap } from "./game_servers/gs_types";
import { UserManager } from "./user_manager";

export class VotingMode implements GameMode {
    getModeName(): GameModeName {
        return 'voting';
    }

    handleClientMsg(msg: ClientMsg, clientWs: WebSocket, cons: ConnectionMap, um: UserManager): GameModeName {
        return 'voting';
    }
}