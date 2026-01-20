import { JSONSchemaType } from "ajv";

export interface ChooseSongData {
    song_id: string;
};
export const chooseSongSchema: JSONSchemaType<ChooseSongData> = {
    type: "object",
    properties: {
        song_id: {type: "string"}
    },
    required: ["song_id"]
};