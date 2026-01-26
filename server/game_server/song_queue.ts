import { JSONSchemaType } from "ajv";
import { Validator } from "../handlers/validator";
import { SpotifyAPI, TrackInfo } from "../spotify/spotify_api";
import { Action, buildActionSchema } from "./action";
import { EventProvider } from "./event_provider";
import { GMEventContext } from "../modes/game_mode";
import { PlayerList } from "./player_list";

interface AddToQueueData {
    track_info: object; // Should be TrackInfo
}

const addToQueueDataSchema: JSONSchemaType<AddToQueueData> = {
    type: "object",
    properties: {
        track_info: {type: "object"}
    },
    required: ["track_info"]
};

export class SongQueue {
    private eventProvider: EventProvider<GMEventContext>;
    private validator: Validator<GMEventContext>;
    private trackQueue: TrackInfo[];

    private playerList: PlayerList;
    private songManager: SpotifyAPI;
    
    constructor(eventProvider: EventProvider<GMEventContext>, playerList: PlayerList, songManager: SpotifyAPI) {
        this.trackQueue = [];

        this.playerList = playerList;
        this.songManager = songManager;

        this.eventProvider = eventProvider;
        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("add_to_queue", addToQueueDataSchema),
            handler: (action, context) => this.onAddToQueue(action, context),
        });
    
        this.eventProvider.onAction((action, context) => this.validator.validateAndHandle(action, context));
    }

    enqueue(track: TrackInfo) {
        this.trackQueue.push(track);
    }

    dequeue(): TrackInfo | undefined {
        return this.trackQueue.shift();
    }

    private onAddToQueue(action: Action<AddToQueueData>, context: GMEventContext) {
        const trackInfo = action.data.track_info as TrackInfo;
        this.enqueue(trackInfo);

        this.playerList.getHost()!.getConnection().sendAction({
            action: "song_added",
            data: {
                track_info: trackInfo
            }
        });

        this.songManager.queue(trackInfo.track_uri);
    }
}