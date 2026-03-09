import assert from "assert";
import { NextRequest, NextResponse } from "next/server";

interface GameInfo {
    user_token: string;
    game_id: number;
    server_url: string;
};

export async function GET(request: NextRequest) {
    assert(process.env.NEXT_PUBLIC_API_URL !== undefined);
    assert(process.env.NEXT_PUBLIC_URL !== undefined);

    const params = request.nextUrl.searchParams;
    const gameId = params.get('game_id');
    const name = params.get('name');

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/join/${gameId}?name=${name}`);
        if(!res.ok) {
            throw new Error(`Error: Received error response ${res.status}: ${res.statusText}`);
        }

        const gameInfo: GameInfo = await res.json(); 
        
        const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/game`);
        response.cookies.set('user_token', gameInfo.user_token);
        response.cookies.set('game_id', gameInfo.game_id.toString());
        response.cookies.set('server_url', gameInfo.server_url);

        return response;
    }
    catch(err) {
        console.error(err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/?${new URLSearchParams({
            "error": "Error: Failed to join game. Please try again."
        }).toString()}`);
    }
}