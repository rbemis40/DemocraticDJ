import { GameMode, GameModeAction } from "../game_mode";
import * as LobbyActions from "./lobby_actions";
import { User } from "../../game_server/user";
import { Action } from "../../game_server/action";
import { PlayerList } from "../../game_server/player_list";

export class LobbyMode extends GameMode {
    constructor() {
        super('lobby');
    }

    override getActions(): GameModeAction<object>[] {
        return [
            LobbyActions.requestStartAction
        ]
    }

    override handleAction(action: Action<object>, sendingPlayer: User, allPlayers: PlayerList): GameMode {
        switch (action.name) {
            case 'request_start':
                return this;
            default:
                return this;
        }
    }

    override getNewJoinAction(newPlayer: User, allPlayers: PlayerList): Action<object> {
        return {
            name: 'user_list',
            data: {
                user_list: allPlayers.getUsernames()
            }
        }
    }
}

// const mode_name = 'lobby';

// export function addLobbyHandlers(msgHandler: MessageHandler) {
//     msgHandler.defineAction(mode_name, 'joined_mode', noDataSchema);
//     msgHandler.on(mode_name, 'joined_mode', handleUserJoinedMode);
    
//     msgHandler.defineAction(mode_name, 'start_request', noDataSchema);
//     msgHandler.on(mode_name, 'start_request', handleUserStartRequest);
// }

// function handleUserJoinedMode(msg: Msg<NoData>, user: User, game: Game) {
//     // Send the user the list of currently joined users
//     const userListMsg: OutboundMsg<UserListData> = {
//         game_mode: mode_name,
//         action: {
//             name: 'user_list',
//             data: {
//                 user_list: game.getUserList()
//             }
//         }
//     };

//     user.sendMsg(userListMsg);
// }

// function handleUserStartRequest(msg: Msg<NoData>, user: User, game: Game) {
//     // Verify that the user is the host
//     if (!user.isHost) {
//         console.error(`User ${user.username} attempted to start game, but is not host`);
//         return; // TODO: Send error?
//     }

//     game.setMode('voting'); // Move the game into voting mode
// }

// export default {
//     addLobbyHandlers
// };