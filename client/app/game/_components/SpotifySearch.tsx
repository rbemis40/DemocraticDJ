import { FormEvent, useRef, useState } from "react";
import { UIProps } from "../types";
import useServerMsg from "../_hooks/server_msg_hook";
import { SpotifySearchResult } from "../_types/spotify_types";
import SongCard from "./SongCard";
import styles from "./SpotifySearch.module.css";

type SpotifySearchUI = UIProps;
interface SpotifyResultsData {
    results: SpotifySearchResult[]
};

export default function SpotifySearch(props: SpotifySearchUI) {
    const queryRef = useRef<string>('');
    const [results, setResults] = useState<SpotifySearchResult[] | undefined>();

    function search(e: FormEvent) {
        e.preventDefault();

        props.sendMsg(JSON.stringify({
            action: 'song_search',
            data: {
                query: queryRef.current
            }
        }));
    }

    function closeSearch() {
        setResults(undefined);
    }

    function chooseSong(id: string) {
        props.sendMsg(JSON.stringify({
            action: 'choose_song',
            data: {
                song_id: id
            }
        }));

        closeSearch();
    }

    useServerMsg((msg) => {
        switch (msg.action) {
            case 'spotify_results': {
                const resultData = msg.data as SpotifyResultsData;
                setResults(resultData.results);
                break;
            }
        }
    }, ['spotify_results']);

    return (
        <div className={styles.container}>
            <form className={styles.searchForm} onSubmit={search}>
                <input
                    className={styles.searchInput}
                    placeholder="Search for a song..."
                    onChange={(e) => queryRef.current = e.target.value}
                />
                <button className="neon-btn-cyan" type='submit'>Search</button>
            </form>
            {
                results &&
                <div className={styles.resultsList}>
                    {results?.map(result =>
                        <div className={styles.resultItem} key={result.id} onClick={() => chooseSong(result.id)}>
                            <SongCard info={result}/>
                        </div>
                    )}
                    <button className="neon-btn-outline" onClick={closeSearch}>Close</button>
                </div>
            }
        </div>
    );
}