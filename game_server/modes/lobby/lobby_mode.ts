import { GameMode } from "../game_mode.js";
import { JoinedModeData, StartGameData } from "./lobby_schemas.js";
import { Action } from "../../action.js";
import { PlayerList } from "../../player_list.js";
import { Player } from "../../player.js";
import { GameModeSequencer } from "../../game/game_mode_sequencer.js";

export class LobbyMode extends GameMode {
    private playerList: PlayerList;
    private gmSequencer: GameModeSequencer;

    constructor(playerList: PlayerList, gmSequencer: GameModeSequencer) {
        super('lobby');
        
        this.playerList = playerList;
        this.gmSequencer = gmSequencer;
    }

    handleAction(action: Action<object>, player: Player): void {
        super.handleAction(action, player);

        switch(action.action) {
            case "start_game": {
                this.onStartGame(action, player);
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

    removePlayer(player: Player) {
        // Send the updated user list for the remaining players
        this.playerList.broadcast({
            action: "user_list",
            data: {
                user_list: this.playerList.getUsernames()
            }
        });
    }

    private onStartGame(action: Action<StartGameData>, player: Player) {
        this.gmSequencer.nextMode();
    }
}