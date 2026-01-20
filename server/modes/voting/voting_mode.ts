import { Action } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { User } from "../../game_server/user";
import { GameMode, ServerContext } from "../game_mode";

export class VotingMode extends GameMode {
    protected handleJoinMode(data: Action<object>, context: ServerContext): void {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super("voting_mode");
    }  
}