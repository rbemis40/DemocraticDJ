import { useState } from "react";
import { SpotifySearchResult } from "../_types/spotify_types"
import SongCard from "./song_card/song_card";
import useServerMsg from "../_hooks/server_msg_hook";
import { ServerMsg } from "../_types/server_msg";

interface SongQueueProps {};

interface SongAddedData {
    track_info: SpotifySearchResult;
}

export default function SongQueue(props: SongQueueProps) {
    const [queuedSongs, setQueuedSongs] = useState<SpotifySearchResult[]>([]);

    useServerMsg((msg: ServerMsg) => {
        switch(msg.action) {
            case "song_added":
                const songAddedData = msg.data as SongAddedData;
                const newQueue = [...queuedSongs];
                newQueue.push(songAddedData.track_info);
                setQueuedSongs(newQueue);
                break;
        }
    }, ["song_added"])

    return (
        <div id="queue_container">
            <h1>Song Queue</h1>
            {
                queuedSongs.map((song => <SongCard key={song.track_uri} info={song}/>))
            }
        </div>
    );
}