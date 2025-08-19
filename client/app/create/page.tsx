'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GameInfo } from "../types/types";

export default function CreatePage() {
    const router = useRouter();

    // Contact the game management server to get a game id and user token for the host
    console.log(process.env.NEXT_PUBLIC_API_URL)
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/create`)
            .then(res => res.json())
            .then((body: GameInfo) => router.push(`/game/${body.game_id}`));
    }, []);
    
    return (
        <h1>Creating game...</h1>        
    );
}