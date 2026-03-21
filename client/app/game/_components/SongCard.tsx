"use client";

import { useState } from "react";
import { SpotifySearchResult } from "../_types/spotify_types";
import styles from "./SongCard.module.css";

interface SongCardProps {
    info: SpotifySearchResult;
    priority?: "high" | "low";
};

export default function SongCard(props: SongCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);

    const artistNames = props.info.artists.reduce((curText, artist, i) => {
        if (i === props.info.artists.length - 1) {
            return curText + artist;
        }

        return curText + artist + ", ";
    }, "");


    return (
        <div className={styles.songCardContainer}>
            {!imgLoaded && <div className={styles.albumCoverPlaceholder} />}
            <img
                className={styles.albumCover}
                src={props.info.image.url}
                alt={props.info.name}
                width={75}
                height={75}
                onLoad={() => setImgLoaded(true)}
                fetchPriority={props.priority}
                style={imgLoaded ? {} : { display: "none" }}
            />
            <div className={styles.textContainer}>
                <p className={styles.songName}>{props.info.name}</p>
                <p className={styles.artistName}>{artistNames}</p>
            </div>
        </div>
    );
}