import { JSONSchemaType } from "ajv";
import { Action, buildActionSchema } from "../action.js";
import { EventProvider } from "../event_provider.js";
import { Validator } from "../handlers/validator.js";
import { GMEventContext } from "../modes/game_mode.js";
import { MusicService, TrackInfo } from "./music_service.js";

export interface SongSearchData {
    query: string;
}
export const songSearchDataSchema: JSONSchemaType<SongSearchData> = {
    type: "object",
    properties: {
        query: {type: "string"}
    },
    required: ["query"]
};

export class MusicServiceEventHandler {
    private validator: Validator<GMEventContext>;
    private musicService: MusicService;

    constructor(musicService: MusicService, eventProvider: EventProvider<GMEventContext>) {
        this.musicService = musicService;
        this.validator = new Validator();

        this.validator.addPair({
            schema: buildActionSchema("song_search", songSearchDataSchema),
            handler: (action, context) => this.onSongSearch(action, context),
        });

        eventProvider.onAction((action, context) => this.validator.validateAndHandle(action, context));
    }

    private async onSongSearch(action: Action<SongSearchData>, context: GMEventContext) {
        if (!context.source?.playerData?.isVoter) {
            console.log(`Attempt to search by non-active user`);
            return; // Only allow the active voter to search for songs
        }

        const searchResults: TrackInfo[] = await this.musicService.search(action.data.query);
        context.source.con.sendAction({
            action: "spotify_results",
            data: {
                results: searchResults
            }
        });
    }
}