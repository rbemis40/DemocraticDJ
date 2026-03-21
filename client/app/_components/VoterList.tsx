import SongCard from "../game/_components/SongCard";
import VoterCard from "../game/_components/VoterCard";
import { SpotifySearchResult } from "../game/_types/spotify_types";
import styles from "./VoterList.module.css";

interface VoterData {
    username: string;
    choice?: SpotifySearchResult;
}

interface VoterListProps {
    voters: VoterData[];
}

export default function VoterList({ voters }: VoterListProps) {
    console.log(voters);
    return (
        <div className={styles.nameList}>
            {voters.map((voter, index) =>
                <VoterCard key={`${voter.username}`} username={voter.username} delay={500 + (index * 750)}>
                    {voter.choice && <SongCard info={voter.choice} />}
                </VoterCard>
            )}
        </div>
    );
}
