import { SpotifySearchResult } from "../_types/spotify_types"
import SongCard from "./song_card/song_card";

interface SongQueueProps {
    queuedSongs: SpotifySearchResult[];
};

export default function SongQueue(props: SongQueueProps) {
    return (
        <div id="queue_container">
            <h1>Song Queue</h1>
            {
                props.queuedSongs.map((song => <SongCard key={song.track_uri} info={song}/>))
            }
        </div>
    );
}