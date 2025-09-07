import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const spotifyAPIVals = {
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/create`,
        show_dialog: 'true'
    };

    const spotifyURL = 'https://accounts.spotify.com/authorize?' + (new URLSearchParams(spotifyAPIVals)).toString();

    return NextResponse.redirect(spotifyURL);
}