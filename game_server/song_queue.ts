import { TrackInfo } from "./music_services/music_service.js";
import { PlayerList } from "./player_list.js";

export class SongQueue {
    private playerList: PlayerList;

    constructor(playerList: PlayerList) {
        this.playerList = playerList;
    }

    add(track: TrackInfo) {
        this.playerList.getHost().getConnection().sendObj({
            action: "add_to_queue",
            data: {
                track: track
            }
        });
    }
}