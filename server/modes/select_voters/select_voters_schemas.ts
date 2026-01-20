import { JSONSchemaType } from "ajv";

export interface VoterSongSelectedData {
    song_id: string;
};
export const songSelectedSchema: JSONSchemaType<VoterSongSelectedData> = {
    type: "object",
    properties: {
        song_id: {type: "string"}
    },
    required: ["song_id"]
};