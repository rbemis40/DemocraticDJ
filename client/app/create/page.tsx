'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface GameInfo {
    host_token: string;
    game_id: number;
}

export default function CreatePage() {
    const router = useRouter();

    // Contact the game management server to get a game id and user token for the host
    useEffect(() => {
        fetch('http://127.0.0.1:80/create')
            .then(res => res.json())
            .then(body => router.push(`/game/${body.game_id}`));
    }, []);
    
    return (
        <h1>Creating game...</h1>        
    );
}