import { Action } from "../../action.js";
import { PlayerList } from "../../player_list.js";
import { Player } from "../../player.js";
import { GameMode } from "../game_mode.js";
import { MusicService } from "../../music_services/music_service.js";
import { NextModeService } from "../../game_services.js";

export class SelectVotersMode extends GameMode {
    private playerList: PlayerList;
    private musicService: MusicService;
    private maxNumVoters: number;
    private voters: Player[];
    private timerEndTime: number;
    private nextModeService: NextModeService;

    constructor(playerList: PlayerList, musicService: MusicService, maxNumVoters: number, nextModeService: NextModeService) {
        super("select_voters");

        this.playerList = playerList;
        this.musicService = musicService;
        this.maxNumVoters = maxNumVoters;
        this.nextModeService = nextModeService;

        this.voters = this.chooseVoters();

        const timerLengthMs = 10000;
        this.timerEndTime = Date.now() + timerLengthMs;

        setTimeout(() => this.nextModeService(), timerLengthMs + 1000);
    }

    handleAction(action: Action<object>, player: Player): void {
        super.handleAction(action, player);
        switch(action.action) {

        }
    }

    protected onJoinMode(data: Action<object>, player: Player) {
        this.sendVoterList(player);
        this.sendTimerUpdate(player);
    }

    playerLeft(player: Player): void {}

    private chooseVoters(): Player[] {
        const players: Player[] = this.playerList.all().filter(player => !player.isHost);
        const numVoters = Math.min(this.maxNumVoters, players.length);

        // Fisher-Yates shuffle
        const shuffled = [...players];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, numVoters);
    }

    private sendVoterList(player: Player) {
        player.getConnection().sendObj({
            action: "voter_list",
            data: {
                voter_list: this.voters.map(player => ({
                    username: player.username,
                    playerId: player.playerId
                }))
            }
        });
    }

    private sendTimerUpdate(player: Player) {
        player.getConnection().sendObj({
            action: "timer_update",
            data: {
                timer_expires: this.timerEndTime
            }
        });
    }
}