import Image from "next/image";
import { SpotifySearchResult } from "../../_types/spotify_types";
import styles from "./song_card_style.module.css";

interface SongCardProps {
    info: SpotifySearchResult;
};

export default function SongCard(props: SongCardProps) {
    let artistNames = props.info.artists.reduce((curText, artist, i) => {
        if (i === props.info.artists.length - 1) {
            return curText + artist;
        }

        return curText + artist + ", ";
    }, "");
    

    return (
        <div className={styles.song_card_container}>
            <img src={props.info.image.url} alt={props.info.name} width={100} height={100}/>
            <div>
                <h2>{props.info.name}</h2>
                <p>{artistNames}</p>
            </div>
        </div>
    );
}