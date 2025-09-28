import { JSONSchemaType } from "ajv";
import { MessageHandler, Msg, NoData, noDataSchema } from "../handlers/message_handler";
import { User } from "../game_server/user";
import { Game } from "../game_server/game";

function addLobbyHandlers(msgHandler: MessageHandler) {
    const target = 'lobby';
    msgHandler.defineAction(target, 'start_request', noDataSchema);
    msgHandler.on(target, 'start_request', handleUserStartRequest);
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