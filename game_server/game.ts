import { Action } from "./action.js";
import { GameModeSequencer } from "./game/game_mode_sequencer.js";
import { LobbyMode } from "./modes/lobby/lobby_mode.js";
import { SelectVotersMode } from "./modes/select_voters/select_voters_mode.js";
import { MusicService } from "./music_services/music_service.js";
import { Player } from "./player.js";
import { PlayerList } from "./player_list.js";

export class Game {
    private gmSequencer: GameModeSequencer;
    private playerList: PlayerList;
    private musicService: MusicService;
    private onCloseCallback: () => void;
    
    constructor(musicService: MusicService) {
        this.playerList = new PlayerList();
        this.musicService = musicService;
        this.gmSequencer = new GameModeSequencer([
            () => new LobbyMode(this.playerList, () => this.nextMode(), (player) => this.removePlayer(player)),
            () => new SelectVotersMode(this.playerList, this.musicService, 3, () => this.nextMode()),
        ]);
        this.onCloseCallback = () => {};
    }

    addPlayer(player: Player) {
        console.log("Adding player");
        if (player.username !== undefined && this.playerList.isUsernameTaken(player.username)) {
            console.warn(`Player attempted to join with taken username ${player.username}`);
            player.getConnection().close(); // TODO: Send some sort of descriptive error, so the user knows what went wrong
            return;
        }

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
        if (player.isHost) {
            console.warn("Attempt to remove host");
            return;
        }

        player.getConnection().close();
        this.playerList.removePlayer(player.playerId);
        this.gmSequencer.getCurrentMode().playerLeft(player);
    }

    onPlayerDisconnect(player: Player) {
        console.log("Player disconnected");
        if (player.isHost) {
            console.log("Host disconnected");
            this.playerList.all().forEach(player => {
                player?.getConnection().close(); // No need to remove from the playerlist or anything, since the game has ended anyway
            });
            this.onCloseCallback();
            return;
        }

        this.playerList.removePlayer(player.playerId);
        this.gmSequencer.getCurrentMode().playerLeft(player);
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