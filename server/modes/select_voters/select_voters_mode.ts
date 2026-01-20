import { Action } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import { SpotifySearchData } from "../../game_server/server_types";
import { User } from "../../game_server/user";
import { GameMode, ServerContext } from "../game_mode";

export class SelectVotersMode extends GameMode {
    private timeRem: number; // Tracks the amount of time left on the timer
    private voters: Map<User, string | undefined>; // Maps each voter to the song id for their selection
    
    constructor(playerList: PlayerList) {
        super("select_voters");

        this.voters = new Map<User, string | undefined>();
        this.chooseVoters(playerList, 2).forEach(user => {
            this.voters.set(user, undefined);
        });
        this.timeRem = 30;
    }

    protected handleJoinMode(data: Action<object>, context: ServerContext) {
        const voterData: { username: string | undefined; choice: string | undefined; }[] = [];
        this.voters.forEach((choice, user) => {
            voterData.push({
                username: user.username,
                choice: choice
            });
        });
        
        context.sender!.sendMsg({
            action: "voter_mode_state",
            data: {
                voters: voterData,
                timeRem: this.timeRem
            }
        });
    }

    private chooseVoters(playerList: PlayerList, maxK: number): User[] {
        const usernames = playerList.getUsernames();

        const k = Math.min(usernames.length, maxK);

        // Fisher-Yates shuffle
        for (let i = usernames.length - 1; i > 0; i--) {
            // Choose random index to swap with
            const swapI = Math.floor(Math.random() * (i - 1))
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
}