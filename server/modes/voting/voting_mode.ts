import { Action } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { Player } from "../../game_server/player";
import { GameMode, ServerContext } from "../game_mode";
import { EventProvider } from "../../game_server/event_provider";

export class VotingMode extends GameMode {
    protected onJoinMode(data: Action<object>, context: ServerContext): void {
        throw new Error("Method not implemented.");
    }
    constructor(eventProvider: EventProvider<ServerContext>) {
        super("voting_mode", eventProvider);
    }  
}