import { SpotifySearchResult } from "../_types/spotify_types";
import styles from "./SongCard.module.css";

interface SongCardProps {
    info: SpotifySearchResult;
};

export default function SongCard(props: SongCardProps) {
    const artistNames = props.info.artists.reduce((curText, artist, i) => {
        if (i === props.info.artists.length - 1) {
            return curText + artist;
        }

        return curText + artist + ", ";
    }, "");
    

    return (
        <div className={styles.songCardContainer}>
            <img className={styles.albumCover} src={props.info.image.url} alt={props.info.name} width={75} height={75}/>
            <div className={styles.textContainer}>
                <p className={styles.songName}>{props.info.name}</p>
                <p className={styles.artistName}>{artistNames}</p>
            </div>
        </div>
    );
}