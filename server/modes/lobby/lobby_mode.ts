import { GameMode, PlayerData } from "../game_mode";
import schemas, { JoinedModeData, RemovePlayerData } from "./lobby_schemas";
import { User } from "../../game_server/user";
import { Action, buildActionSchema } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { typeSafeBind } from "../../utils";

export class LobbyMode extends GameMode {
    constructor() {
        super('lobby');

        // Add all actions that the lobby can handle
        this.validator.addPair({
            schema: buildActionSchema("joined_mode", schemas.joined_mode),
            handler: typeSafeBind(this.handleJoinedMode, this)
        });

        this.validator.addPair({
            schema: buildActionSchema("remove_player", schemas.remove_player),
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

    private handleJoinedMode(data: Action<JoinedModeData>, context: PlayerData): GameMode {
        /* A user joined the lobby, so send them the list of active players */
        console.log("LobbyMode.handleJoinedMode: Lobby joined mode!!");
        context.all.broadcast({
            action: "user_list",
            data: {
                user_list: context.all.getUsernames()
            }
        })
        return this;
    }

    private handleRemoveUser(data: Action<RemovePlayerData>, context: PlayerData): GameMode {
        console.log("Lobby remove user!!");
        return this;
    }
}