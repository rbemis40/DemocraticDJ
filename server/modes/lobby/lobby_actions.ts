import { JSONSchemaType } from "ajv";
import { GameModeAction } from "../game_mode";


type RequestStartData = {};
export const requestStartAction: GameModeAction<RequestStartData> = {
    name: 'request_start',
    schema: {
        type: 'object'
    }
}