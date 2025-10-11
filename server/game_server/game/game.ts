import { MessageHandler, Msg } from "../../handlers/message_handler";
import { GameMode } from "../../modes/game_mode";
import { LobbyMode } from "../../modes/lobby/lobby_mode";
import { GameId } from "../../shared_types";
import { PlayerList } from "../player_list";
import { OutboundMsg, User } from "../user";
import * as GameActions from "./game_actions";

export class Game {
    id: GameId;
    mode: GameMode;
    private players: PlayerList;
    private msgHandler: MessageHandler;

    constructor(id: GameId, msgHandler: MessageHandler) {
        this.id = id;
        this.players = new PlayerList();
        this.msgHandler = msgHandler;

        this.mode = new LobbyMode();

        // Setup any handlers that need to be available all game, such as a user changing modes
        this.msgHandler.defineAction('joined_mode', GameActions.joinedModeSchema);
        this.msgHandler.on('joined_mode', (msg: Msg<GameActions.JoinedModeData>, player: User) => this.handlePlayerJoinedMode(player));
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

    changeMode(newMode: GameMode) {
        // Deregister all of the current mode's action handlers
        this.mode.getActions().forEach(action => {
            this.msgHandler.deleteAction(action.name);
        });

        // Register all of the new mode's action handlers, and make the game handle each
        newMode.getActions().forEach(action => {
            this.msgHandler.defineAction(action.name, action.schema);
            this.msgHandler.on(action.name, (msg: Msg<object>, player: User) => this.processGameModeMsg(msg, player));
        });

        this.mode = newMode;
    }

    processGameModeMsg(msg: Msg<object>, player: User) {
        if (msg.game_mode !== this.mode.getName()) {
            console.error(`Client message contained game mode ${msg.game_mode}, but the current mode is ${this.mode.getName()}`);
            // TODO: Send error to client
        }

        const newMode: GameMode = this.mode.handleAction(msg.action, player, this.players);
        if (newMode !== this.mode) {
            this.changeMode(newMode); // Transition into the requested mode
        }
    }

    /**
     * Handles when a user joins the current mode for the first time, sends init data determined by mode.getNewJoinAction
     * @param player - The player who just joined the mode
     */
    private handlePlayerJoinedMode(player: User) {
        const joinAction = this.mode.getNewJoinAction(player, this.getPlayerList());
        const joinMsg: OutboundMsg<object> = {
            game_mode: this.mode.getName(),
            action: joinAction
        }

        player.sendMsg(joinMsg);
    }
}