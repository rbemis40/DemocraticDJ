import { Action } from "../../action.js";
import { PlayerList } from "../../player_list.js";
import { Player } from "../../player.js";
import { GameMode } from "../game_mode.js";
import { MusicService } from "../../music_services/music_service.js";

export class SelectVotersMode extends GameMode {
    private playerList: PlayerList;
    private musicService: MusicService;
    private maxNumVoters: number;

    constructor(playerList: PlayerList, musicService: MusicService, maxNumVoters: number) {
        super("select_voters");

        this.playerList = playerList;
        this.musicService = musicService;
        this.maxNumVoters = maxNumVoters;
    }

    handleAction(action: Action<object>, player: Player): void {
        super.handleAction(action, player);
        switch(action.action) {

        }
    }

    protected onJoinMode(data: Action<object>, player: Player) {
        throw new Error("Method not implemented.");
    }

    removePlayer(player: Player): void {
        throw new Error("Method not implemented.");
    }

    private chooseVoters() {
        const numVoters = Math.min(this.maxNumVoters, this.playerList.numPlayers);
        this.playerList.getUsernames();
    }
}