import { NextRequest, NextResponse } from "next/server";
import { GameInfo } from "../types/types";

export async function GET(request: NextRequest) {
    const gameInfo: GameInfo = await fetch(`http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}/create`)
        .then(res => res.json());

    console.log(gameInfo);

    console.log(request.url);
    const response = NextResponse.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/game`);
    response.cookies.set('user_token', gameInfo.host_token);
    response.cookies.set('game_id', gameInfo.game_id.toString());
    response.cookies.set('server_url', gameInfo.server_url);

    return response;
}