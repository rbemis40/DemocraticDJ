'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface GameInfo {
    host_token: string;
    game_id: number;
}

export default function CreatePage() {
    const router = useRouter();

    const [gameInfo, setGameInfo] = useState<GameInfo | undefined>(undefined)

    // Contact the game management server to get a game id and user token for the host
    useEffect(() => {
        fetch('http://127.0.0.1:80/create').then(res => 
            res.json()
        ).then(body => setGameInfo(body));
    }, []);
    
    return (
        gameInfo ? <h1>Created game {gameInfo.game_id} as user {gameInfo.host_token}</h1> : <h1>Creating new game...</h1>
        
    );
}