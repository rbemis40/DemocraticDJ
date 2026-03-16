import { Action } from "./action.js";
import { EventProvider } from "./event_provider.js";
import { GameModeSequencer } from "./game/game_mode_sequencer.js";
import { GameMode, GMEventContext } from "./modes/game_mode.js";
import { LobbyMode } from "./modes/lobby/lobby_mode.js";
import { SelectVotersMode } from "./modes/select_voters/select_voters_mode.js";
import { MusicService } from "./music_services/music_service.js";
import { MusicServiceFactory } from "./music_services/music_service_factory.js";
import { Player } from "./player.js";
import { PlayerList } from "./player_list.js";

export class Game {
    private gmSequencer: GameModeSequencer;
    private playerList: PlayerList;
    private onCloseCallback: () => void;
    
    constructor() {
        this.playerList = new PlayerList();
        this.gmSequencer = new GameModeSequencer([
            () => new LobbyMode(this.playerList, () => this.nextMode(), (player) => this.removePlayer(player)),
        ]);
        this.onCloseCallback = () => {};
    }

    addPlayer(player: Player) {
        console.log("Adding player");
        this.playerList.addPlayer(player);
        player.getConnection().sendObj({
            action: "welcome",
            data: {
                role: player.isHost ? "host" : "player",
                game_mode: this.gmSequencer.getCurrentMode().getName(),
                player_name: player.username
            }
        });
    }

    removePlayer(player: Player) {
        console.log("Removing player");
        player.getConnection().close(); // Ensure the connection is closed. Might not be closed if removed by host for example.
        if (player.isHost) {
            this.playerList.getUsernames().forEach(username => {
                const player = this.playerList.getPlayerByUsername(username);
                player?.getConnection().close();
            });
            this.onCloseCallback();
            return;
        }

        this.playerList.removePlayer(player);
        this.gmSequencer.getCurrentMode().onPlayerDisconnect(player);
    }

    handlePlayerAction(action: Action<object>, player: Player) {
        console.log("Handling action");
        this.gmSequencer.getCurrentMode().handleAction(action, player);
    }

    onClose(callback: () => void) {
        this.onCloseCallback = callback;
    }

    private nextMode() {
        this.gmSequencer.nextMode();
        this.playerList.broadcast({
            action: "change_mode",
            data: {
                gamemode: this.gmSequencer.getCurrentMode().getName()
            }
        });
    }
}