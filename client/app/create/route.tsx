import { NextRequest, NextResponse } from "next/server";
import { GameInfo } from "../types/types";

export async function GET(request: NextRequest) {
    const gameInfo: GameInfo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create`)
        .then(res => res.json());

    console.log(gameInfo);

    let response = NextResponse.redirect(new URL('/game', request.url));
    response.cookies.set('user_token', gameInfo.host_token);
    response.cookies.set('game_id', gameInfo.game_id.toString());
    response.cookies.set('server_url', gameInfo.server_url);

    return response;
}