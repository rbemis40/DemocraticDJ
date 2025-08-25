'use client';

import { useEffect } from "react";

interface GameInfoProps {
    game_id: number;
    user_token: string;
    server_url: string;
};

export default function GameUI(props: GameInfoProps) {
    // Connect to game server
    useEffect(() => {
        const ws = new WebSocket(props.server_url);
        ws.addEventListener('error', (e) => {
            console.error('A websocket error was encountered!');
        });

        ws.addEventListener('open', () => {
            console.log(`Websocket connection established to game server ${props.server_url}`);
        });

        ws.addEventListener('message', (e) => {
            console.log(`Received message from game server: ${e.data}`);
        });

        ws.addEventListener('close', (e) => {
            console.log(`Closing connection to game server`);
            ws.close();
        });

        return () => ws.close();
    }, []);

    return (
        <div>
            <h1>You have joined a game with info: </h1>
            <h2>Game Id: {props.game_id}</h2>
            <h2>User Token: {props.user_token}</h2>
            <h2>Server URL: {props.server_url}</h2>
        </div>
    );
}