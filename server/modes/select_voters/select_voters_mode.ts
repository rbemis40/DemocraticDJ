import { Action, buildActionSchema } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { SpotifySearchData } from "../../game_server/server_types";
import { User } from "../../game_server/user";
import { TrackInfo } from "../../spotify/spotify_manager";
import { typeSafeBind } from "../../utils";
import { GameMode, ServerContext } from "../game_mode";
import { chooseSongSchema, ChooseSongData } from "./select_voters_schemas";

export class SelectVotersMode extends GameMode {
    private timeRem: number; // Tracks the amount of time left on the timer
    private voters: Map<string, TrackInfo | undefined>; // Maps each voter to the song id for their selection
    
    constructor(playerList: PlayerList, context: ServerContext) {
        super("select_voters");

        this.voters = new Map<string, TrackInfo | undefined>(); // Username -> song id (choice)
        this.chooseVoters(playerList, 2).forEach(user => {
            this.voters.set(user.username!, undefined);
            user.isVoter = true;
        });
        this.timeRem = 30;

        this.validator.addPair({
            schema: buildActionSchema("choose_song", chooseSongSchema),
            handler: typeSafeBind(this.handleChooseSong, this)
        });

        this.startTimer(context);
    }

    protected handleJoinMode(data: Action<object>, context: ServerContext) {
        const voterData: { username: string; choice: TrackInfo | undefined; }[] = [];
        this.voters.forEach((choice, username) => {
            voterData.push({
                username: username,
                choice: choice
            });
        });

        // If the user has been selected to vote, inform them
        if (context.sender!.username !== undefined && this.voters.has(context.sender!.username)) {
            context.sender!.sendMsg({
                action: "change_voter_state",
                data: {
                    isVoter: true
                }
            });
        }

        context.sender!.sendMsg({
            action: "voter_mode_state",
            data: {
                voters: voterData,
                timeRem: this.timeRem,
            }
        });
    }

    private chooseVoters(playerList: PlayerList, maxK: number): User[] {
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
        const voters: User[] = [];
        for (let i = 0; i < k; i++) {
            voters.push(playerList.getUserByUsername(usernames[i])!);    
        }
        
        return voters;
    }

    private async handleChooseSong(action: Action<ChooseSongData>, context: ServerContext) {
        if (!context.sender!.isVoter) {
            console.log(`SelectVotersMode.handleSongSelected: Non-voter ${context.sender?.username} attempted to select song`);
            return;
        }
        
        const songId = action.data.song_id;
        const songInfo = await context.songManager.getSongById(songId);

        this.voters.set(context.sender!.username!, songInfo); // Update the state
        
        context.all.broadcast({
            action: "song_selected",
            data: {
                username: context.sender!.username,
                song_data: songInfo
            }
        });
    }

    private startTimer(context: ServerContext) {
        const intId = setInterval(() => {
            this.timeRem -= 1;
            if (this.timeRem <= 0) {
                clearInterval(intId);
                context.all.broadcast({
                    action: "song_select_over",
                    data: {}
                })
            }
        }, 1000);
    }
}