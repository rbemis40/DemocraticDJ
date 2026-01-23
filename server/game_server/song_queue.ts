import { JSONSchemaType } from "ajv";
import { Validator } from "../handlers/validator";
import { ServerContext } from "../modes/game_mode";
import { TrackInfo } from "../spotify/spotify_api";
import { Action, buildActionSchema } from "./action";
import { EventProvider } from "./event_provider";

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
    private eventProvider: EventProvider<ServerContext>;
    private validator: Validator<ServerContext>;
    private trackQueue: TrackInfo[];
    
    constructor(eventProvider: EventProvider<ServerContext>) {
        this.trackQueue = [];

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

    private onAddToQueue(action: Action<AddToQueueData>, context: ServerContext) {
        const trackInfo = action.data.track_info as TrackInfo;
        this.enqueue(trackInfo);

        context.allPlayers.getHost()!.getConnection().sendAction({
            action: "song_added",
            data: {
                track_info: trackInfo
            }
        });
    }
}