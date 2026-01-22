import { Validator } from "../../handlers/validator";
import { GameMode, ServerContext } from "../../modes/game_mode";
import { LobbyMode } from "../../modes/lobby/lobby_mode";
import { SelectVotersMode } from "../../modes/select_voters/select_voters_mode";
import { VotingMode } from "../../modes/voting/voting_mode";
import { GameId } from "../../shared_types";
import { SpotifyManager } from "../../spotify/spotify_manager";
import { Action } from "../action";
import { EventProvider } from "../event_provider";
import { PlayerList } from "../player_list";
import { EventContext } from "../server_types";
import { OutboundMsg, User } from "../user";
import * as GameActions from "./game_actions";

type AllowedModes = LobbyMode | VotingMode | SelectVotersMode;

export class Game {
    id: GameId;
    mode: AllowedModes;
    private players: PlayerList;

    constructor(id: GameId, eventProvider: EventProvider<ServerContext>) {
        this.id = id;
        this.players = new PlayerList();

        this.mode = new LobbyMode();
        eventProvider.onAction((action: Action<object>, context: ServerContext) => {
            this.handleInternalAction(action, context);
        });
    }

    addPlayer(player: User) {
        this.players.addPlayer(player);
    }

    removePlayer(player: User) {
        this.players.removePlayer(player);
    }

    getPlayerList(): PlayerList {
        return this.players;   
    }

    handleAction(action: Action<object>, eventContext: EventContext) {
        //console.log("Handling action:");
        //console.log(action);
        //console.log(`Game.handleAction: ${this.getPlayerList().getUsernames()}`);
        //console.log(`Game.handleAction: this.players =`);
        //console.log(this.players);
        //console.log(`Game.handleAction: this.getPlayerList() = `);
        //console.log(this.getPlayerList());
        const sender = eventContext.user;
        const eventProvider = eventContext.eventProvider;
        this.mode.handleAction(action, sender, this.getPlayerList(), eventProvider, eventContext.songManager);
    }

    handleInternalAction(action: Action<object>, context: ServerContext) {
        console.log("Game.handleInternalAction:");
        console.log(action);
        switch(action.action) {
            case "next_game_mode": {
                this.mode = new SelectVotersMode(this.getPlayerList(), context);
                this.getPlayerList().broadcast({
                    action: "change_mode",
                    data: {
                        gamemode: this.mode.getName()
                    }
                });
                break;
            }
        }

        
    }
}