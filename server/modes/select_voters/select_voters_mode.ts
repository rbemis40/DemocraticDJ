import { Action, buildActionSchema } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { Player } from "../../game_server/player";
import { TrackInfo } from "../../spotify/spotify_api";
import { GameMode, ServerContext } from "../game_mode";
import { chooseSongSchema, ChooseSongData } from "./select_voters_schemas";
import { EventProvider } from "../../game_server/event_provider";
import { JSONSchemaType } from "ajv";

interface SongSelectOverData {}

interface VoteCastData {
    voted_for: string;
}
const voteCastDataSchema: JSONSchemaType<VoteCastData> = {
    type: "object",
    properties: {
        voted_for: {type: "string"}
    },
    required: ["voted_for"]
};

type CountObj = {
    username: string,
    count: number
}

type State = "select" | "vote" | "results";


export class SelectVotersMode extends GameMode {
    private timerStart: number; // Tracks the amount of time left on the timer
    private timerLength: number; // The number of seconds each timer should last
    private chooser: Map<string, TrackInfo | undefined>; // Maps each voter to the song id for their selection
    private voteMap: Map<string, string>; // Stores who each player voted for
    private context: ServerContext; // THIS IS TEMPORARY
    private state: State;
    
    constructor(playerList: PlayerList, eventProvider: EventProvider<ServerContext>, context: ServerContext) {
        super("select_voters", eventProvider);

        this.state = "select";
        this.context = context;

        this.voteMap = new Map();

        this.chooser = new Map<string, TrackInfo | undefined>(); // Username -> song id (choice)
        this.chooseVoters(playerList, 2).forEach(user => {
            this.chooser.set(user.username!, undefined);
            user.isVoter = true;
        });

        this.validator.addPair({
            schema: buildActionSchema("choose_song", chooseSongSchema),
            handler: (action, context) => this.onChooseSong(action, context)
        });

        this.validator.addPair({
            schema: buildActionSchema("vote_cast", voteCastDataSchema),
            handler: (action, context) => this.onVoteCast(action, context)
        })

        this.timerLength = 30;

        this.startTimer(() => this.onSongSelectEnd(playerList));
    }

    protected onJoinMode(data: Action<object>, context: ServerContext) {
        const voterData: { username: string; choice: TrackInfo | undefined; }[] = [];
        this.chooser.forEach((choice, username) => {
            voterData.push({
                username: username,
                choice: choice
            });
        });

        // If the user has been selected to vote, inform them
        if (context.sender!.playerData!.username !== undefined && this.chooser.has(context.sender!.playerData!.username)) {
            context.sender!.con.sendAction({
                action: "change_voter_state",
                data: {
                    isVoter: true
                }
            });
        }

        context.sender!.con.sendAction({
            action: "voter_mode_state",
            data: {
                voters: voterData,
                timeRem: Math.max(0, (this.timerLength * 1000) - (Date.now() - this.timerStart)),
                state: this.state
            }
        });
    }

    private chooseVoters(playerList: PlayerList, maxK: number): Player[] {
        const usernames = playerList.getUsernames();

        const k = Math.min(usernames.length, maxK);

        // Fisher-Yates shuffle
        for (let i = usernames.length - 1; i > 0; i--) {
            // Choose random index to swap with
            const swapI = Math.floor(Math.random() * i)
            const tmp = usernames[swapI];
            usernames[swapI] = usernames[i];
            usernames[i] = tmp;
        }

        // Select k users as the voters
        const voters: Player[] = [];
        for (let i = 0; i < k; i++) {
            voters.push(playerList.getPlayerByUsername(usernames[i])!);    
        }
        
        return voters;
    }

    private async onChooseSong(action: Action<ChooseSongData>, context: ServerContext) {
        if (this.state !== "select") {
            console.warn(`Player '${context.sender?.playerData?.username}' attempted to vote during select state!`);
            return;
        }

        if (!context.sender!.playerData!.isVoter) {
            console.warn(`SelectVotersMode.handleSongSelected: Non-voter ${context.sender!.playerData!.username} attempted to select song`);
            return;
        }

        if (Date.now() - this.timerStart >= this.timerLength * 1000) {
            console.warn(`Player '${context.sender!.playerData!.username}' attempted to select song after time expired!`);
            return;
        }
        
        const songId = action.data.song_id;
        const songInfo = await context.songManager.getSongById(songId);

        this.chooser.set(context.sender!.playerData!.username!, songInfo); // Update the state
        
        context.allPlayers.broadcast({
            action: "song_selected",
            data: {
                username: context.sender!.playerData!.username,
                song_data: songInfo
            }
        });
    }

    private startTimer(onComplete: () => void) {
        this.timerStart = Date.now();
        let remTime = this.timerLength * 1000;
        
        const wait = (remTime: number) => {
            if (remTime <= 0) {
                onComplete();
                return;
            }

            setTimeout(() => {
                wait((this.timerLength * 1000) - (Date.now() - this.timerStart));
            }, remTime);
        };

        wait(remTime);
    }

    private onSongSelectEnd(playerList: PlayerList) {
        this.state = "vote"; // Change the mode into the voting state, so players vote on which song they want to hear

        this.timerStart = Date.now();

        playerList.broadcast({
            action: "song_select_over",
            data: {
                state: this.state,
                timeRem: Math.max(0, (this.timerLength * 1000) - (Date.now() - this.timerStart))
            }
        });

        this.startTimer(() => this.onVotingEnd(playerList));
    }

    private onVoteCast(action: Action<VoteCastData>, context: ServerContext) {
        if (context.sender === undefined || context.sender.playerData === undefined || context.sender.playerData.username === undefined) {
            console.warn(`Invalid sender attempted to vote!`);
            return;
        }

        if (this.state !== "vote") {
            console.warn(`Player '${context.sender.playerData.username}' attempted to vote during select state!`);
            return;
        }

        if (Date.now() - this.timerStart >= this.timerLength * 1000) {
            console.warn(`Player '${context.sender.playerData.username}' attempted to vote after timer expired!`);
            return;
        }

        console.log(`'${context.sender.playerData.username}' voted for '${action.data.voted_for}'`);
        if (context.sender.playerData.username === action.data.voted_for) {
            console.warn(`Player '${context.sender.playerData.username}' attempted to vote for themselves!`);
            return;
        }

        if (!this.chooser.has(action.data.voted_for)) {
            console.warn(`Player '${context.sender.playerData.username}' attempted to vote for non-chooser '${action.data.voted_for}'!`);
            return;
        }

        // Mark their vote
        this.voteMap.set(context.sender.playerData.username, action.data.voted_for);
        context.allPlayers.broadcast({
            action: "vote_count",
            data: {
                count: this.voteMapToCount()
            }
        });
    }

    private voteMapToCount() : CountObj[] {
        // Make sure that even if no one voted, the countObj is still initialized
        const countObj: {[username: string]: number} = {};
        this.chooser.forEach((value, key) => countObj[key] = 0);

        this.voteMap.forEach((voted_for, username) => {
            countObj[voted_for] += 1;
        });

        return Object.entries(countObj).map((value => ({
            username: value[0],
            count: value[1]
        })));
    }

    private onVotingEnd(playerList: PlayerList) {
        this.state = "results";

        const finalCount = this.voteMapToCount();

        // Show one last updated count
        playerList.broadcast({
            action: "vote_count",
            data: {
                count: finalCount
            }
        });

        const winner = this.decideWinner(finalCount);

        playerList.broadcast({
            action: "voting_over",
            data: {
                state: "results",
                ...winner
            }
        });

        // Add the winning song to the queue
        this.eventProvider.dispatchAction({
            action: "add_to_queue",
            data: {
                track_info: this.chooser.get(winner.winner)!
            }
        }, this.context);

        // TEMP
        this.eventProvider.dispatchAction({
            action: "go_back_to_lobby",
            data: {}
        }, this.context);
    }

    private decideWinner(count: CountObj[]): {winner: string, tied: string[]} {
        const buckets: {[key: number]: string[]} = {};
        let maxVotes = 0;
        count.forEach((cur) => {
            if(buckets[cur.count] === undefined) {
                buckets[cur.count] = [];
            }
            buckets[cur.count].push(cur.username);
            maxVotes = Math.max(maxVotes, cur.count); // Keep track of the most votes
        });

        const possibleWinners = buckets[maxVotes];
        console.log("SelectVotersMode.decideWinner: Possible winners: ");
        console.log(possibleWinners);

        // Break any ties by choosing randomly
        const winner = possibleWinners[Math.floor(Math.random() * possibleWinners.length)];
        return {
            winner: winner,
            tied: possibleWinners
        }
    }
}