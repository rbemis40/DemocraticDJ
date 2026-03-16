import { GameMode } from "../game_mode.js";
import { JoinedModeData, StartGameData } from "./lobby_schemas.js";
import { Action } from "../../action.js";
import { PlayerList } from "../../player_list.js";
import { Player } from "../../player.js";
import { NextModeService, RemovePlayerService } from "../../game_services.js";
import Ajv, { JSONSchemaType } from "ajv";

const ajv = new Ajv.Ajv();

type RemovePlayerData = {
    username: string;
}
const removePlayerSchema: JSONSchemaType<RemovePlayerData> = {
    type: "object",
    properties: {
        username: {type: "string"}
    },
    required: ["username"],
    additionalProperties: false
};

export class LobbyMode extends GameMode {
    private playerList: PlayerList;
    private nextModeService: NextModeService;
    private removePlayerService: RemovePlayerService;

    constructor(playerList: PlayerList, nextModeFn: NextModeService, removePlayerFn: RemovePlayerService) {
        super('lobby');
        
        this.playerList = playerList;
        this.nextModeService = nextModeFn;
        this.removePlayerService = removePlayerFn;
    }

    handleAction(action: Action<object>, player: Player): void {
        super.handleAction(action, player);

        switch(action.action) {
            case "start_game": {
                this.onStartGame(action, player);
                break;
            }
            case "remove_player": {
                if(!ajv.validate(removePlayerSchema, action.data)) {
                    console.warn("Invalid remove_player message!");
                    return;
                }

                const playerToRemove = this.playerList.getPlayerByUsername(action.data.username);
                if (playerToRemove === undefined) {
                    console.warn(`Attempt to remove unknown user "${action.data.username}"`);
                    return;
                }
                if (playerToRemove.isHost) {
                    console.warn(`Attempt to remove host player!`);
                    return;
                }

                this.removePlayerService(playerToRemove);
                break;
            }
        }
    }

    protected onJoinMode(action: Action<JoinedModeData>, player: Player) {
        /* A user joined the lobby, so send them the list of active players */
        console.log("LobbyMode.handleJoinedMode: Lobby joined mode!!");
        this.playerList.broadcast({
            action: "user_list",
            data: {
                user_list: this.playerList.getUsernames()
            }
        });
    }

    onPlayerDisconnect(player: Player) {
        // Send the updated user list for the remaining players
        this.playerList.broadcast({
            action: "user_list",
            data: {
                user_list: this.playerList.getUsernames()
            }
        });
    }

    private onStartGame(action: Action<StartGameData>, player: Player) {
        this.nextModeService();
    }
}