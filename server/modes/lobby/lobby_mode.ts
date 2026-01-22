import { GameMode, ServerContext } from "../game_mode";
import schemas, { JoinedModeData, RemovePlayerData, StartGameData } from "./lobby_schemas";
import { User } from "../../game_server/user";
import { Action, buildActionSchema } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { typeSafeBind } from "../../utils";

export class LobbyMode extends GameMode {
    constructor() {
        super('lobby');

        // // Add all actions that the lobby can handle
        // this.validator.addPair({
        //     schema: buildActionSchema("joined_mode", schemas.joined_mode),
        //     handler: typeSafeBind(this.handleJoinedMode, this)
        // });

        this.validator.addPair({
            schema: buildActionSchema("remove_player", schemas.remove_player),
            handler: typeSafeBind(this.handleRemoveUser, this)
        });

        this.validator.addPair({
            schema: buildActionSchema("start_game", schemas.start_game),
            handler: typeSafeBind(this.handleStartGame, this)
        });
    }

    protected handleJoinMode(action: Action<JoinedModeData>, context: ServerContext) {
        /* A user joined the lobby, so send them the list of active players */
        console.log("LobbyMode.handleJoinedMode: Lobby joined mode!!");
        context.all.broadcast({
            action: "user_list",
            data: {
                user_list: context.all.getUsernames()
            }
        });
    }

    private handleRemoveUser(action: Action<RemovePlayerData>, context: ServerContext) {
        context.eventProvider.dispatchAction({
            action: "internal_disconnect",
            data: {
                user: context.all.getUserByUsername(action.data.username)
            }
        }, context);

        // Send the updated user list after disconnecting the user
        context.all.broadcast({
            action: "user_list",
            data: {
                user_list: context.all.getUsernames()
            }
        });
    }

    private handleStartGame(action: Action<StartGameData>, context: ServerContext) {
        console.log("LobbyMode.handleStartGame: ")
        console.log(action);
        context.eventProvider.dispatchAction({
            action: "next_game_mode",
            data: {}
        }, context);
    }
}