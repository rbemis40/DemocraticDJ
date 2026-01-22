import { Action, buildActionSchema } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { SpotifySearchData } from "../../game_server/server_types";
import { Player } from "../../game_server/player";
import { TrackInfo } from "../../spotify/spotify_manager";
import { typeSafeBind } from "../../utils";
import { GameMode, ServerContext } from "../game_mode";
import { chooseSongSchema, ChooseSongData } from "./select_voters_schemas";
import { EventProvider } from "../../game_server/event_provider";

export class SelectVotersMode extends GameMode {
    private timeRem: number; // Tracks the amount of time left on the timer
    private voters: Map<string, TrackInfo | undefined>; // Maps each voter to the song id for their selection
    
    constructor(playerList: PlayerList, eventProvider: EventProvider<ServerContext>) {
        super("select_voters", eventProvider);

        this.voters = new Map<string, TrackInfo | undefined>(); // Username -> song id (choice)
        this.chooseVoters(playerList, 2).forEach(user => {
            this.voters.set(user.username!, undefined);
            user.isVoter = true;
        });
        this.timeRem = 30;

        this.validator.addPair({
            schema: buildActionSchema("choose_song", chooseSongSchema),
            handler: (data, context) => this.onChooseSong(data, context)
        });

        this.startTimer(playerList);
    }

    protected onJoinMode(data: Action<object>, context: ServerContext) {
        const voterData: { username: string; choice: TrackInfo | undefined; }[] = [];
        this.voters.forEach((choice, username) => {
            voterData.push({
                username: username,
                choice: choice
            });
        });

        // If the user has been selected to vote, inform them
        if (context.sender!.playerData!.username !== undefined && this.voters.has(context.sender!.playerData!.username)) {
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
                timeRem: this.timeRem,
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
        if (!context.sender!.playerData!.isVoter) {
            console.log(`SelectVotersMode.handleSongSelected: Non-voter ${context.sender!.playerData!.username} attempted to select song`);
            return;
        }
        
        const songId = action.data.song_id;
        const songInfo = await context.songManager.getSongById(songId);

        this.voters.set(context.sender!.playerData!.username!, songInfo); // Update the state
        
        context.allPlayers.broadcast({
            action: "song_selected",
            data: {
                username: context.sender!.playerData!.username,
                song_data: songInfo
            }
        });
    }

    private startTimer(allPlayers: PlayerList) {
        const intId = setInterval(() => {
            this.timeRem -= 1;
            if (this.timeRem <= 0) {
                clearInterval(intId);
                allPlayers.broadcast({
                    action: "song_select_over",
                    data: {}
                })
            }
        }, 1000);
    }
}