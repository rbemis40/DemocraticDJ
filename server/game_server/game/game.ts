import { GameMode } from "../../modes/game_mode";
import { LobbyMode } from "../../modes/lobby/lobby_mode";
import { GameId } from "../../shared_types";
import { Action } from "../action";
import { EventProvider } from "../event_provider";
import { PlayerList } from "../player_list";
import { EventContext } from "../server_types";
import { OutboundMsg, User } from "../user";
import * as GameActions from "./game_actions";

type AllowedModes = LobbyMode;

export class Game {
    id: GameId;
    mode: AllowedModes;
    private players: PlayerList;

    constructor(id: GameId) {
        this.id = id;
        this.players = new PlayerList();

        this.mode = new LobbyMode();
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
        this.mode.handleAction(action, sender, this.getPlayerList(), eventProvider);
    }
}