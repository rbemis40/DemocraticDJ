import { Action } from "../../action.js";
import { PlayerList } from "../../player_list.js";
import { Player } from "../../player.js";
import { ajv, GameMode } from "../game_mode.js";
import { MusicService, TrackInfo } from "../../music_services/music_service.js";
import { NextModeService } from "../../game_services.js";
import { JSONSchemaType } from "ajv";

type SongSearchData = {
    query: string;
};

const songSearchSchema: JSONSchemaType<SongSearchData> = {
    type: "object",
    properties: {
        query: {type: "string"}
    },
    required: ["query"],
    additionalProperties: false
};

type ChooseSongData = {
    song_id: string;
}

const chooseSongSchema: JSONSchemaType<ChooseSongData> = {
    type: "object",
    properties: {
        song_id: {type: "string"}
    },
    required: ["song_id"],
    additionalProperties: false
}


export class SelectVotersMode extends GameMode {
    private playerList: PlayerList;
    private musicService: MusicService;
    private maxNumVoters: number;
    private voters: Player[];
    private songChoices: Map<Player, TrackInfo>;
    private timerEndTime: number;
    private nextModeService: NextModeService;

    constructor(playerList: PlayerList, musicService: MusicService, maxNumVoters: number, nextModeService: NextModeService) {
        super("select_voters");

        this.playerList = playerList;
        this.musicService = musicService;
        this.maxNumVoters = maxNumVoters;
        this.nextModeService = nextModeService;

        this.voters = this.chooseVoters();
        this.songChoices = new Map();

        const timerLengthMs = 30000;
        this.timerEndTime = Date.now() + timerLengthMs;

        setTimeout(() => this.nextModeService(), timerLengthMs + 1000);
    }

    handleAction(action: Action<object>, player: Player): void {
        super.handleAction(action, player);
        switch(action.action) {
            case "song_search": {
                if(!ajv.validate(songSearchSchema, action.data)) {
                    console.warn("Invalid song_search action!");
                    return;
                }

                if (!this.isVoter(player)) {
                    console.warn("Non-voter player attempted to search for songs");
                    return;
                }

                this.musicService.search(action.data.query)
                    .then(tracks => {
                        this.sendSearchResults(tracks, player);
                    })
                    .catch(err => {
                        console.error(err);
                    });
                break;
            }
            case "choose_song": {
                if(!ajv.validate(chooseSongSchema, action.data)) {
                    console.warn("Invalid choose_song action!");
                    return;
                }

                if(!this.isVoter(player)) {
                    console.warn("Non-voter attempted to choose song!");
                    return;
                }

                this.musicService.getTrackInfoById(action.data.song_id)
                    .then(track => {
                        this.songChoices.set(player, track);
                        this.sendSongChosen(track, player);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
        }
    }

    protected onJoinMode(data: Action<object>, player: Player) {
        this.sendVoterList(player);
        this.sendTimerUpdate(player);
        if (this.voters.includes(player)) {
            this.sendMakeVoter(player);
        }
    }

    playerLeft(player: Player): void {}

    getVoterChoices(): Map<Player, TrackInfo> {
        return this.songChoices;
    }

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

    private sendMakeVoter(player: Player) {
        player.getConnection().sendObj({
            action: "make_voter",
            data: {
                isVoter: true
            }
        });
    }

    private sendSearchResults(tracks: TrackInfo[], player: Player) {
        player.getConnection().sendObj({
             action: "search_results",
             data: {
                results: tracks
             }
        });
    }

    private sendSongChosen(track: TrackInfo, player: Player) {
        this.playerList.getHost().getConnection().sendObj({
            action: "song_chosen",
            data: {
                username: player.username,
                choice: track
            }
        });
    }

    private isVoter(player: Player): boolean {
        return this.voters.includes(player);
    }
}