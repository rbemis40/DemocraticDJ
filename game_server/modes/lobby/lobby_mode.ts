import { GameMode, GMEventContext } from "../game_mode.js";
import schemas, { JoinedModeData, RemovePlayerData, StartGameData } from "./lobby_schemas.js";
import { Action, buildActionSchema } from "../../action.js";
import { EventProvider } from "../../event_provider.js";
import { PlayerLeaveData, playerLeaveDataSchema } from "../../server_types.js";
import { PlayerList } from "../../player_list.js";

export class LobbyMode extends GameMode {
    private playerList: PlayerList;
    
    constructor(eventProvider: EventProvider<GMEventContext>, playerList: PlayerList) {
        super('lobby', eventProvider);

        this.playerList = playerList;

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

    protected onJoinMode(action: Action<JoinedModeData>, context: GMEventContext) {
        /* A user joined the lobby, so send them the list of active players */
        console.log("LobbyMode.handleJoinedMode: Lobby joined mode!!");
        this.playerList.broadcast({
            action: "user_list",
            data: {
                user_list: this.playerList.getUsernames()
            }
        });
    }

    private onRemovePlayer(action: Action<RemovePlayerData>, context: GMEventContext) {
        this.eventProvider.dispatchAction({
            action: "player_leave",
            data: {
                player: this.playerList.getPlayerByUsername(action.data.username)
            }
        }, context);
    }

    private onPlayerLeave(action: Action<PlayerLeaveData>, context: GMEventContext) {
        // Send the updated user list for the remaining players
        this.playerList.broadcast({
            action: "user_list",
            data: {
                user_list: this.playerList.getUsernames()
            }
        });
    }

    private onStartGame(action: Action<StartGameData>, context: GMEventContext) {
        console.log("LobbyMode.handleStartGame: ")
        console.log(action);
        this.eventProvider.dispatchAction({
            action: "next_game_mode",
            data: {}
        }, context);
    }
}