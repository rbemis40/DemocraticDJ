import { ModeSequence } from "../../game/mode_sequence.js";
import { NextModeService } from "../../game_services.js";
import { MusicService } from "../../music_services/music_service.js";
import { PlayerList } from "../../player_list.js";
import { GameMode } from "../game_mode.js";
import { SelectVotersMode } from "./select_voters_mode.js";
import { VotingMode } from "./voting_mode.js";

export class VotingSequence implements ModeSequence {
    private state: "song_selection" | "voting" | "done";
    private curMode: GameMode | undefined;
    private playerList: PlayerList;
    private musicService: MusicService;
    private nextModeService: NextModeService;

    constructor(playerList: PlayerList, musicService: MusicService, nextMode: NextModeService) {
        this.state = "song_selection";
        this.curMode = new SelectVotersMode(playerList, musicService, 3, nextMode);

        this.playerList = playerList;
        this.musicService = musicService;
        this.nextModeService = nextMode;
    }

    getMode(): GameMode | undefined {
        return this.curMode;
    }

    nextMode(): GameMode | undefined {
        switch (this.state) {
            case "song_selection":
                this.state = "voting";
                this.curMode = new VotingMode(
                    (this.curMode as SelectVotersMode).getVoterChoices(),
                    this.playerList,
                    this.nextModeService
                );
                break;
            case "voting":
                this.state = "done";
                this.curMode = undefined;
                break;
        }

        return this.curMode;
    }
}