'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GameInfo } from "../types/types";

export default function JoinPage() {
    const router = useRouter();
    const params = useSearchParams()
    const gameId = params.get('game_id');
    
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/join/${gameId}`)
            .then(res => res.json())
            .then((body: GameInfo) => router.push(`/game/${body.game_id}`));
    }, []);

    return (
        <h1>Joining game...</h1>
    );
}