'use client';

import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

// This page will be the page that displays the actual content for the game (host vs player)
export default function JoinedGame({params} : {params: Promise<{id: number}>}) {
    const searchParams = useSearchParams();
    const { id } = use(params);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:80/game/${id}`);
        
        ws.addEventListener('error', (error) => {
            console.error(error);
        });
        
        ws.addEventListener('open', () => {
            ws.send('hello from the client!');
        });

        ws.addEventListener('message', (msg) => {
            console.log(`Message received from server: ${msg.data}`);
        });

        return () => { ws.close(); };
    }, []);

    return (
        <h1>You have joined game {id}</h1>
    );
}