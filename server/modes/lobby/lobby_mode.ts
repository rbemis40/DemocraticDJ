import { GameMode, ServerContext } from "../game_mode";
import schemas, { JoinedModeData, RemovePlayerData, StartGameData } from "./lobby_schemas";
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

        this.validator.addPair({
            schema: buildActionSchema("start_game", schemas.start_game),
            handler: typeSafeBind(this.handleStartGame, this)
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

    private handleJoinedMode(action: Action<JoinedModeData>, context: ServerContext): GameMode {
        /* A user joined the lobby, so send them the list of active players */
        console.log("LobbyMode.handleJoinedMode: Lobby joined mode!!");
        context.all.broadcast({
            action: "user_list",
            data: {
                user_list: context.all.getUsernames()
            }
        });
        return this;
    }

    private handleRemoveUser(action: Action<RemovePlayerData>, context: ServerContext): GameMode {
        context.eventProvider.dispatchAction({
            action: "internal_disconnect",
            data: {
                user: context.all.getUserByUsername(action.data.username)
            }
        });

        // Send the updated user list after disconnecting the user
        context.all.broadcast({
            action: "user_list",
            data: {
                user_list: context.all.getUsernames()
            }
        });

        return this;
    }

    private handleStartGame(action: Action<StartGameData>, context: ServerContext) : GameMode {
        console.log("Start game!!");
        return this;
    }
}