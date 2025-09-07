import { NextRequest, NextResponse } from "next/server";

interface GameInfo {
    user_token: string;
    game_id: number;
    server_url: string;
};

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const gameId = params.get('game_id');
    const name = params.get('name');
    const gameInfo: GameInfo = await fetch(`http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}/join/${gameId}?name=${name}`)
            .then(res => res.json());
    
    const response = NextResponse.redirect(`http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/game`);
    response.cookies.set('user_token', gameInfo.user_token);
    response.cookies.set('game_id', gameInfo.game_id.toString());
    response.cookies.set('server_url', gameInfo.server_url);

    return response;
}