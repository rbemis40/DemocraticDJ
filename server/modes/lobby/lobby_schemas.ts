import { JSONSchemaType } from "ajv";
import { Action } from "../../game_server/action";

//TODO: Moved joined mode into GameMode, since it is shared between all modes

// Define the Action data that lobby will handle
export interface JoinedModeData {}

export interface RemovePlayerData {
    username: string;
}

// Define the schemas for each of the Action datas
interface Schemas {
    joined_mode: JSONSchemaType<JoinedModeData>;
    remove_player: JSONSchemaType<RemovePlayerData>;
}

const schemas: Schemas = {
    joined_mode: {
        type: "object"
    },
    remove_player: {
        type: "object",
        properties: {
            username: {type: "string"}
        },
        required: ["username"]
    }
}

export default schemas;