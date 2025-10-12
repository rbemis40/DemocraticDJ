import { JSONSchemaType } from "ajv";
import { GameModeAction } from "../game_mode";

type RequestStartData = {};
export const requestStartAction: GameModeAction<RequestStartData> = {
    name: 'request_start',
    schema: {
        type: 'object'
    }
};

type RemovePlayerData = {
    username: string;
};
export const removePlayerAction: GameModeAction<RemovePlayerData> = {
    name: 'remove_player',
    schema: {
        type: 'object',
        properties: {
            username: {type: 'string'}
        },
        required: ['username']
    }
};