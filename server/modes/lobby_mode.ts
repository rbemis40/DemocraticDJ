import { Game } from "../game_server/game";
import { UserListData } from "../game_server/server_types";
import { OutboundMsg, User } from "../game_server/user";
import { MessageHandler, Msg, NoData, noDataSchema } from "../handlers/message_handler";

const mode_name = 'lobby';

export function addLobbyHandlers(msgHandler: MessageHandler) {
    msgHandler.defineAction(mode_name, 'joined_mode', noDataSchema);
    msgHandler.on(mode_name, 'joined_mode', handleUserJoinedMode);
    
    msgHandler.defineAction(mode_name, 'start_request', noDataSchema);
    msgHandler.on(mode_name, 'start_request', handleUserStartRequest);
}

function handleUserJoinedMode(msg: Msg<NoData>, user: User, game: Game) {
    // Send the user the list of currently joined users
    const userListMsg: OutboundMsg<UserListData> = {
        game_mode: mode_name,
        action: {
            name: 'user_list',
            data: {
                user_list: game.getUserList()
            }
        }
    };

    user.sendMsg(userListMsg);
}

function handleUserStartRequest(msg: Msg<NoData>, user: User, game: Game) {
    // Verify that the user is the host
    if (!user.isHost) {
        console.error(`User ${user.username} attempted to start game, but is not host`);
        return; // TODO: Send error?
    }

    game.setMode('voting'); // Move the game into voting mode
}

export default {
    addLobbyHandlers
};