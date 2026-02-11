import { JSONSchemaType } from "ajv";
import { Validator } from "./handlers/validator.js";
import { Action, buildActionSchema } from "./action.js";
import { EventProvider } from "./event_provider.js";
import { GMEventContext } from "./modes/game_mode.js";
import { PlayerList } from "./player_list.js";
import { TrackInfo } from "./music_services/music_service.js";

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
    
    constructor(eventProvider: EventProvider<GMEventContext>, playerList: PlayerList) {
        this.trackQueue = [];

        this.playerList = playerList;

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
    }
}