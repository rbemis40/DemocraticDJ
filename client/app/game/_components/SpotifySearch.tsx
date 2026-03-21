import { FormEvent, useState } from "react";
import { UIProps } from "../types";
import useServerMsg from "../_hooks/server_msg_hook";
import { SpotifySearchResult } from "../_types/spotify_types";
import SongCard from "./SongCard";
import styles from "./SpotifySearch.module.css";
import NeonDivider from "@/app/_components/NeonDivider";

interface SpotifySearchUIProps extends UIProps {
    onChoice?: (result: SpotifySearchResult) => void;
};

interface SpotifyResultsData {
    results: SpotifySearchResult[],
};

export default function SpotifySearch(props: SpotifySearchUIProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SpotifySearchResult[] | undefined>();
    const [loading, setLoading] = useState(false);

    function search(e: FormEvent) {
        e.preventDefault();

        setLoading(true);
        props.sendMsg(JSON.stringify({
            action: 'song_search',
            data: {
                query
            }
        }));
    }

    function closeSearch() {
        setResults(undefined);
    }

    function chooseSong(choice: SpotifySearchResult) {
        props.sendMsg(JSON.stringify({
            action: 'choose_song',
            data: {
                song_id: choice.id
            }
        }));

        props.onChoice?.(choice);
        setQuery('');
        closeSearch();
    }

    useServerMsg((msg) => {
        switch (msg.action) {
            case 'search_results': {
                const resultData = msg.data as SpotifyResultsData;
                setResults(resultData.results);
                setLoading(false);
                break;
            }
        }
    }, ['search_results']);

    return (
        <div className={`glass-card ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={`neon-text-magenta`}>Song Search</h1>
                <NeonDivider/>
            </div>
            <form className={styles.searchForm} onSubmit={search}>
                <input
                    className={styles.searchInput}
                    placeholder="Search for a song..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className={`neon-btn-cyan ${styles.searchButton}`} type='submit'>Search</button>
            </form>
            {loading && <p className={styles.loadingText}>Searching...</p>}
            {
                results &&
                <div className={styles.resultsList}>
                    {results?.map((result, index) =>
                        <div className={styles.resultItem} key={result.id} onClick={() => chooseSong(result)}>
                            <SongCard info={result} priority={index < 3 ? "high" : "low"}/>
                        </div>
                    )}
                    <button className="neon-btn-outline" onClick={closeSearch}>Close</button>
                </div>
            }
        </div>
    );
}