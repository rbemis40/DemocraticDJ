import { GameMode, GameModeAction } from "../game_mode";
import * as LobbyActions from "./lobby_actions";
import { User } from "../../game_server/user";
import { Action } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";
import Ajv from "ajv";

export class LobbyMode extends GameMode {
    constructor() {
        super('lobby');
    }

    override getActions<T>(): GameModeAction<T>[] {
        return [
            LobbyActions.requestStartAction,
            LobbyActions.removePlayerAction
        ]
    }

    override getNewJoinAction(newPlayer: User, allPlayers: PlayerList): Action<object> {
        return {
            name: 'user_list',
            data: {
                user_list: allPlayers.getUsernames()
            }
        }
    }

    override handleAction(action: Action<object>, sendingPlayer: User, allPlayers: PlayerList): GameMode {
        switch (action.name) {
            case 'request_start':
                return this;
            default:
                return this;
        }
    }
}