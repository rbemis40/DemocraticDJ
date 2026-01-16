import { Action } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { User } from "../../game_server/user";
import { GameMode } from "../game_mode";

export class VotingMode extends GameMode {
    constructor() {
        super("voting_mode");
    }

    getNewJoinAction(newPlayer: User, allPlayers: PlayerList): Action<object> {
        return {
            action: "user_list",
            data: {
                user_list: allPlayers.getUsernames()
            }
        }
    }
}