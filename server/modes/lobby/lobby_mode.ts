import { GameMode, ServerContext } from "../game_mode";
import schemas, { JoinedModeData, RemovePlayerData, StartGameData } from "./lobby_schemas";
import { Action, buildActionSchema } from "../../game_server/action";
import { typeSafeBind } from "../../utils";
import { EventProvider } from "../../game_server/event_provider";

export class LobbyMode extends GameMode {
    constructor(eventProvider: EventProvider<ServerContext>) {
        super('lobby', eventProvider);

        // // Add all actions that the lobby can handle
        // this.validator.addPair({
        //     schema: buildActionSchema("joined_mode", schemas.joined_mode),
        //     handler: typeSafeBind(this.handleJoinedMode, this)
        // });

        this.validator.addPair({
            schema: buildActionSchema("remove_player", schemas.remove_player),
            handler: (data, context) => this.onRemoveUser(data, context)
        });

        this.validator.addPair({
            schema: buildActionSchema("start_game", schemas.start_game),
            handler: (data, context) => this.onStartGame(data, context)
        });
    }

    protected onJoinMode(action: Action<JoinedModeData>, context: ServerContext) {
        /* A user joined the lobby, so send them the list of active players */
        console.log("LobbyMode.handleJoinedMode: Lobby joined mode!!");
        context.allPlayers.broadcast({
            action: "user_list",
            data: {
                user_list: context.allPlayers.getUsernames()
            }
        });
    }

    private onRemoveUser(action: Action<RemovePlayerData>, context: ServerContext) {
        context.eventProvider.dispatchAction({
            action: "internal_disconnect",
            data: {
                user: context.allPlayers.getUserByUsername(action.data.username)
            }
        }, context);

        // Send the updated user list after disconnecting the user
        context.allPlayers.broadcast({
            action: "user_list",
            data: {
                user_list: context.allPlayers.getUsernames()
            }
        });
    }

    private onStartGame(action: Action<StartGameData>, context: ServerContext) {
        console.log("LobbyMode.handleStartGame: ")
        console.log(action);
        context.eventProvider.dispatchAction({
            action: "next_game_mode",
            data: {}
        }, context);
    }
}