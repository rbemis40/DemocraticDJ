import { FormEvent, useRef, useState } from "react";
import { UIProps } from "../types";
import useServerMsg from "../_hooks/server_msg_hook";
import { SpotifySearchResult } from "../_types/spotify_types";
import Image from "next/image";
import SongCard from "./song_card/song_card";

interface SpotifySearchUI extends UIProps {};
interface SpotifyResultsData {
    results: SpotifySearchResult[]
};

export default function SpotifySearch(props: SpotifySearchUI) {
    const queryRef = useRef<string>('');
    const [results, setResults] = useState<SpotifySearchResult[] | undefined>();

    function search(e: FormEvent) {
        e.preventDefault();

        props.sendMsg(JSON.stringify({
            action: 'spotify_search',
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
        }))
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
        <>
            <form onSubmit={search}>
                <input onChange={(e) => queryRef.current = e.target.value}></input>
                <button type='submit'>Submit</button>
            </form>
            {
                results &&
                <div>
                    {results?.map(result =>
                        <div key={result.id}>
                            <SongCard info={result}/>
                            <button onClick={() => chooseSong(result.id)}>Choose Song</button>
                        </div>
                    )}
                    <button onClick={closeSearch}>Close</button>
                </div>
            }
        </>
    );
}