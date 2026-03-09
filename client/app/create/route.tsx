import { NextResponse } from "next/server";
import { GameInfo } from "../_types/types";
import assert from "assert";

export async function GET() {
    assert(process.env.NEXT_PUBLIC_API_URL !== undefined);
    assert(process.env.NEXT_PUBLIC_URL !== undefined);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create`);
        if (!res.ok) {
            throw new Error(`Error: Received error response ${res.status}: ${res.statusText}`);
        }

        const gameInfo: GameInfo = await res.json();
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/game`);
        response.cookies.set('user_token', gameInfo.host_token);
        response.cookies.set('game_id', gameInfo.game_id.toString());
        response.cookies.set('server_url', gameInfo.server_url);
            
        return response;
    }
    catch (err) {
        console.error(err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/?${new URLSearchParams({
            "error": "Failed to create game. Please try again."
        }).toString()}`);
    }
}