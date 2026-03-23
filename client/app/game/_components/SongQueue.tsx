import { useState } from "react";
import { SpotifySearchResult } from "../_types/spotify_types"
import SongCard from "./SongCard";
import useServerMsg from "../_hooks/server_msg_hook";
import { ServerMsg } from "../_types/server_msg";
import styles from "./SongQueue.module.css";
import NeonDivider from "@/app/_components/NeonDivider";

interface AddToQueueData {
    track: SpotifySearchResult;
}

export default function SongQueue() {
    const [queuedSongs, setQueuedSongs] = useState<SpotifySearchResult[]>([]);

    useServerMsg((msg: ServerMsg) => {
        switch(msg.action) {
            case "add_to_queue":
                const songAddedData = msg.data as AddToQueueData;
                const newQueue = [...queuedSongs];
                newQueue.push(songAddedData.track);
                setQueuedSongs(newQueue);
                break; 
        }
    }, ["add_to_queue"])

    return (
        <div className={`glass-card ${styles.songQueue}`}>
            <h1 className={`neon-text-magenta`}>Song Queue</h1>
            <NeonDivider width="10rem"/>
            {
                queuedSongs.map((song => <SongCard key={song.track_uri} info={song}/>))
            }
        </div>
    );
}