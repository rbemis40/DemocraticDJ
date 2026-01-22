import { ServerContext } from "../../modes/game_mode";
import { LobbyMode } from "../../modes/lobby/lobby_mode";
import { SelectVotersMode } from "../../modes/select_voters/select_voters_mode";
import { VotingMode } from "../../modes/voting/voting_mode";
import { GameId } from "../../shared_types";
import { Action } from "../action";
import { EventProvider } from "../event_provider";
import { PlayerList } from "../player_list";
import { Player } from "../player";

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

    addPlayer(player: Player) {
        this.players.addPlayer(player);
    }

    removePlayer(player: Player) {
        this.players.removePlayer(player);
    }

    getPlayerList(): PlayerList {
        return this.players;   
    }

    handleAction(action: Action<object>, serverContext: ServerContext) {
        //console.log("Handling action:");
        //console.log(action);
        //console.log(`Game.handleAction: ${this.getPlayerList().getUsernames()}`);
        //console.log(`Game.handleAction: this.players =`);
        //console.log(this.players);
        //console.log(`Game.handleAction: this.getPlayerList() = `);
        //console.log(this.getPlayerList());
        const sender = serverContext.sender;
        const eventProvider = serverContext.eventProvider;
        this.mode.handleAction(action, serverContext);
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