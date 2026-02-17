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

    const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_HOSTNAME}/join/${gameId}?name=${name}`);
    if(!res.ok) {
        console.log(`Error encountered while trying to join game: ${res.status}, ${res.statusText}`);
        return NextResponse.redirect(`http://${process.env.NEXT_PUBLIC_HOSTNAME}`);
    }

    try {
        const gameInfo: GameInfo = await res.json(); 
        
        const response = NextResponse.redirect(`http://${process.env.NEXT_PUBLIC_HOSTNAME}/game`);
        response.cookies.set('user_token', gameInfo.user_token);
        response.cookies.set('game_id', gameInfo.game_id.toString());
        response.cookies.set('server_url', gameInfo.server_url);

        return response;
    }
    catch(err) {
        console.log(err);
        return NextResponse.redirect(`http://${process.env.NEXT_PUBLIC_HOSTNAME}`);
    }
}