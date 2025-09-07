import { NextRequest, NextResponse } from "next/server";
import { GameInfo } from "../_types/types";

export async function GET(request: NextRequest) {
    const gameInfo: GameInfo = await fetch(`http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}/create?code=${request.nextUrl.searchParams.get('code')}`)
        .then(res => res.json());

    const response = NextResponse.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/game`);
    response.cookies.set('user_token', gameInfo.host_token);
    response.cookies.set('game_id', gameInfo.game_id.toString());
    response.cookies.set('server_url', gameInfo.server_url);

    return response;
}