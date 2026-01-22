import { JSONSchemaType } from "ajv";
import { Action, buildActionSchema } from "../game_server/action";
import { EventProvider } from "../game_server/event_provider";
import { Validator } from "../handlers/validator";
import { ServerContext } from "../modes/game_mode";
import { SpotifyAPI, TrackInfo } from "./spotify_api";

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

export class SongManager {
    private eventProvider: EventProvider<ServerContext>;
    private validator: Validator<ServerContext>;

    private spotifyAPI: SpotifyAPI;

    constructor(spotifyAPI: SpotifyAPI, eventProvider: EventProvider<ServerContext>) {
        this.eventProvider = eventProvider;
        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("song_search", songSearchDataSchema),
            handler: (action, context) => this.onSongSearch(action, context),
        });

        this.eventProvider.onAction((action, context) => {
            this.validator.validateAndHandle(action, context);
        })

        this.spotifyAPI = spotifyAPI;
    }


    private async onSongSearch(action: Action<SongSearchData>, context: ServerContext) {
        if (!context.sender?.playerData?.isVoter) {
            console.log(`Attempt to search by non-active user`);
            return; // Only allow the active voter to search for songs
        }

        const searchResults: TrackInfo[] = await this.spotifyAPI.search(action.data.query);
        context.sender.con.sendAction({
            action: "spotify_results",
            data: {
                results: searchResults
            }
        });
    }
}