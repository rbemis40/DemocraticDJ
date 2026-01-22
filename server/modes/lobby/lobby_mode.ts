import { GameMode, ServerContext } from "../game_mode";
import schemas, { JoinedModeData, RemovePlayerData, StartGameData } from "./lobby_schemas";
import { Action, buildActionSchema } from "../../game_server/action";
import { typeSafeBind } from "../../utils";
import { EventProvider } from "../../game_server/event_provider";
import { PlayerLeaveData, playerLeaveDataSchema } from "../../game_server/server_types";

export class LobbyMode extends GameMode {
    constructor(eventProvider: EventProvider<ServerContext>) {
        super('lobby', eventProvider);

        this.validator.addPair({
            schema: buildActionSchema("remove_player", schemas.remove_player),
            handler: (action, context) => this.onRemovePlayer(action, context)
        });

        this.validator.addPair({
            schema: buildActionSchema("player_leave", playerLeaveDataSchema),
            handler: (action, context) => this.onPlayerLeave(action, context)
        });

        this.validator.addPair({
            schema: buildActionSchema("start_game", schemas.start_game),
            handler: (action, context) => this.onStartGame(action, context)
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

    private onRemovePlayer(action: Action<RemovePlayerData>, context: ServerContext) {
        context.eventProvider.dispatchAction({
            action: "player_leave",
            data: {
                player: context.allPlayers.getPlayerByUsername(action.data.username)
            }
        }, context);
    }

    private onPlayerLeave(action: Action<PlayerLeaveData>, context: ServerContext) {
        // Send the updated user list for the remaining players
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