import { Action } from "../../action.js";
import { JoinedModeData } from "../../game/game_actions.js";
import { Player } from "../../player.js";
import { GameMode } from "../game_mode.js";

type SearchSongData = {

};

export class ChooseSongsMode extends GameMode {
    constructor() {
        super("choose_songs");
    }

    handleAction(action: Action<object>, player: Player): void {
        super.handleAction(action, player);
        switch(action.action) {

        }
    }

    protected onJoinMode(data: Action<JoinedModeData>, player: Player): void {
        throw new Error("Method not implemented.");
    }

    playerLeft(player: Player): void {
        throw new Error("Method not implemented.");
    }
}