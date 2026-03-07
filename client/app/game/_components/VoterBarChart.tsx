import { SpotifySearchResult } from "../_types/spotify_types";
import SongCard from "./SongCard";
import styles from "./VoterBarChart.module.css";

interface VoterBarChartProps {
    playerInfo: {
        name: string;
        voteCount?: number;
        choice?: SpotifySearchResult;
    }[],
    height: string;
}

export default function VoterBarChart(props: VoterBarChartProps) {
    let totalVotes = 0;
    for (const info of props.playerInfo) {
        if (info.voteCount !== undefined) totalVotes += info.voteCount;
    }

    return (
        <div className={styles.container} style={{ height: props.height }}>
            {props.playerInfo.map(info =>
                <div className={styles.playerContainer} key={info.name}>
                    <div className={styles.barContainer}>
                        {info.voteCount !== undefined && <div className={styles.bar} style={{ height: `${info.voteCount / totalVotes * 100}%` }}></div>}
                    </div>
                    {info.choice && <SongCard info={info.choice}/>}
                    <p className={`text-spaced ${styles.name}`}>{info.name}</p>
                </div>
            )}
        </div>
    );
}