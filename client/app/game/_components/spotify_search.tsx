import { FormEvent, useRef, useState } from "react";
import { UIProps } from "../types";
import useServerMsg from "../_hooks/server_msg_hook";
import { SpotifySearchResult } from "../_types/spotify_types";
import Image from "next/image";

interface SpotifySearchUI extends UIProps {};

export default function SpotifySearch(props: SpotifySearchUI) {
    const queryRef = useRef<string>('');
    const [results, setResults] = useState<SpotifySearchResult[] | undefined>();

    function search(e: FormEvent) {
        e.preventDefault();

        props.sendMsg(JSON.stringify({
            type: 'spotify_search',
            query: queryRef.current
        }));
    }

    useServerMsg((msg) => {
        switch (msg.type) {
            case 'spotify_results': {
                setResults(msg.tracks);
                console.log(msg.tracks);
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
            {results?.map(result => 
                <div key={result.name + result.image.url}>
                    <h2>Name: {result.name}</h2>
                    <h2>Artist(s): {result.artists.join(', ')}</h2>
                    <img src={result.image.url} width={200} height={200} alt={result.image.url}></img>
                </div>
            )}
        </>
    );
}