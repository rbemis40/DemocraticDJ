import { Action } from "../../action.js";
import { JoinedModeData } from "../../game/game_actions.js";
import { NextModeService } from "../../game_services.js";
import { TrackInfo } from "../../music_services/music_service.js";
import { Player } from "../../player.js";
import { PlayerList } from "../../player_list.js";
import { SongQueue } from "../../song_queue.js";
import { ajv, GameMode } from "../game_mode.js";
import { JSONSchemaType } from "ajv";

type CastVoteData = {
    voter_id: string;
};

const castVoteSchema: JSONSchemaType<CastVoteData> = {
    type: "object",
    properties: {
        voter_id: { type: "string" }
    },
    required: ["voter_id"],
    additionalProperties: false
};

export class VotingMode extends GameMode {
    private voterChoices: Map<Player, TrackInfo>;
    private playerList: PlayerList;
    private songQueue: SongQueue;
    private nextModeService: NextModeService;
    private votes: Map<Player, Player>;
    private timerEndTime: number;

    constructor(voterChoices: Map<Player, TrackInfo>, playerList: PlayerList, songQueue: SongQueue, nextModeService: NextModeService) {
        super("voting_mode");

        this.voterChoices = voterChoices;
        this.playerList = playerList;
        this.songQueue = songQueue;
        this.nextModeService = nextModeService;
        this.votes = new Map();

        const timerLengthMs = 30000;
        this.timerEndTime = Date.now() + timerLengthMs;
        setTimeout(() => this.onVotePeriodEnd(), timerLengthMs + 1000);
    }

    handleAction(action: Action<object>, player: Player): void {
        super.handleAction(action, player);
        switch (action.action) {
            case "cast_vote": {
                if (!ajv.validate(castVoteSchema, action.data)) {
                    console.warn("Invalid cast_vote action!");
                    return;
                }

                const { voter_id } = action.data;
                const targetVoter = [...this.voterChoices.keys()].find(v => v.playerId === voter_id);
                if (!targetVoter) {
                    console.warn("cast_vote: voter_id not found in voterChoices");
                    return;
                }

                if (player === targetVoter) {
                    console.warn("cast_vote: player attempted to vote for themselves");
                    return;
                }

                this.votes.set(player, targetVoter);
                this.broadcastVoteUpdate();
                break;
            }
        }
    }

    protected onJoinMode(data: Action<JoinedModeData>, player: Player): void {
        this.sendVoterChoices(player);
        this.sendTimerUpdate(player);
        this.sendVoteUpdate(player);
    }

    playerLeft(player: Player): void {}

    private sendVoterChoices(player: Player) {
        player.getConnection().sendObj({
            action: "voter_choices",
            data: {
                choices: [...this.voterChoices.entries()].map(([voter, track]) => ({
                    voter: { username: voter.username, playerId: voter.playerId },
                    track: track
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

    private sendVoteUpdate(player: Player) {
        player.getConnection().sendObj({
            action: "vote_update",
            data: {
                votes: this.buildVoteTally()
            }
        });
    }

    private broadcastVoteUpdate() {
        this.playerList.broadcast({
            action: "vote_update",
            data: {
                votes: this.buildVoteTally()
            }
        });
    }

    private onVotePeriodEnd() {
        const winningTrack = this.getWinningTrack();
        if (winningTrack) {
            this.songQueue.add(winningTrack);
        }
        this.nextModeService();
    }

    private getWinningTrack(): TrackInfo | undefined {
        const tally = this.buildVoteTally();
        let winners: { voter_id: string; vote_count: number}[] = [];
        
        for (const curTally of tally) {
            if (winners.length === 0 || curTally.vote_count === winners[0].vote_count) {
                winners.push(curTally);
            }
            else if (curTally.vote_count > winners[0].vote_count) {
                winners = [curTally];
            }
        }

        if (winners.length === 0) return undefined;

        const winner = winners[Math.floor(Math.random() * winners.length)];
        return this.voterChoices.get([...this.voterChoices.keys()].find(v => v.playerId === winner.voter_id)!);
    }

    private buildVoteTally(): { voter_id: string; vote_count: number }[] {
        const tally = new Map<Player, number>();
        for (const voter of this.voterChoices.keys()) {
            tally.set(voter, 0);
        }
        for (const targetVoter of this.votes.values()) {
            tally.set(targetVoter, (tally.get(targetVoter) ?? 0) + 1);
        }
        return [...tally.entries()].map(([voter, vote_count]) => ({
            voter_id: voter.playerId,
            vote_count: vote_count
        }));
    }
}
