import { GameMode, PlayerData } from "../game_mode";
import schemas, { JoinedModeData, RemoveUserData } from "./lobby_schemas";
import { User } from "../../game_server/user";
import { Action } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { typeSafeBind } from "../../utils";

export class LobbyMode extends GameMode {
    constructor() {
        super('lobby');

        // Add all actions that the lobby can handle
        this.validator.addPair({
            schema: schemas.joined_mode,
            handler: typeSafeBind(this.handlerJoinedMode, this)
        });

        this.validator.addPair({
            schema: schemas.remove_user,
            handler: typeSafeBind(this.handleRemoveUser, this)
        });
    }

    getNewJoinAction(newPlayer: User, allPlayers: PlayerList): Action<object> {
        return {
            action: 'user_list',
            data: {
                user_list: allPlayers.getUsernames()
            }
        }
    }

    private handlerJoinedMode(data: JoinedModeData, context: PlayerData): GameMode {
        console.log("Lobby joined mode!!");
        return this;
    }

    private handleRemoveUser(data: RemoveUserData, context: PlayerData): GameMode {
        console.log("Lobby remove user!!");
        return this;
    }
}