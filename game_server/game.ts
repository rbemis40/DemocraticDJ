import { Action } from "./action.js";
import { EventProvider } from "./event_provider.js";
import { GameModeSequencer } from "./game/game_mode_sequencer.js";
import { GameMode, GMEventContext } from "./modes/game_mode.js";
import { LobbyMode } from "./modes/lobby/lobby_mode.js";
import { Player } from "./player.js";
import { PlayerList } from "./player_list.js";

export class Game {
    private gameMode: GameMode;
    private gmSequencer: GameModeSequencer;
    private playerList: PlayerList;
    
    constructor(eventProvider: EventProvider<GMEventContext>) {
        this.playerList = new PlayerList();
        this.gmSequencer = new GameModeSequencer();
        this.gameMode = new LobbyMode(this.playerList, this.gmSequencer);
    }

    addPlayer(player: Player) {
        this.playerList.addPlayer(player);
    }

    removePlayer(player: Player) {
        this.playerList.removePlayer(player);
    }

    handlePlayerAction(action: Action<object>, player: Player) {
    }
}