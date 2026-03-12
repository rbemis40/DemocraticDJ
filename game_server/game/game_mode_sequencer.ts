import { JSONSchemaType } from "ajv";
import { Validator } from "../handlers/validator.js";
import { GameMode, GMEventContext } from "../modes/game_mode.js";
import { LobbyMode } from "../modes/lobby/lobby_mode.js";
import { SelectVotersMode } from "../modes/select_voters/select_voters_mode.js";
import { Action, buildActionSchema } from "../action.js";
import { EventProvider } from "../event_provider.js";
import { PlayerList } from "../player_list.js";
import { MusicService } from "../music_services/music_service.js";

export class GameModeSequencer {
    private curMode: GameMode;

    constructor() {
        this.curMode = new LobbyMode()
    }

    getCurrentModeName(): string {
        return this.mode.getName();
    }

    private switchModes(newMode: GameMode) {
        this.mode.makeInactive();
        this.mode = newMode;
        this.mode.makeActive();
    }

    private onNextGameMode(action: Action<NextGameModeData>, context: GMEventContext) {
        console.log("Game.handleInternalAction:");
        console.log(action);
        switch(action.action) {
            case "next_game_mode": {
                this.switchModes(new SelectVotersMode(this.eventProvider, this.playerList, this.musicService));
                this.playerList.broadcast({
                    action: "change_mode",
                    data: {
                        gamemode: this.mode.getName()
                    }
                });
                break;
            }
            case "go_back_to_lobby": {
                this.switchModes(new LobbyMode(this.eventProvider, this.playerList));
                this.playerList.broadcast({
                    action: "change_mode",
                    data: {
                        gamemode: this.mode.getName()
                    }
                });
                break;
            }
        }

        
    }
}