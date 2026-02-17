import { NextResponse } from "next/server";

export async function GET() {
    const spotifyAPIVals = {
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: `http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/create`,
        scope: 'user-modify-playback-state', // Necessary for queue control
        show_dialog: 'true'
    };

    const spotifyURL = 'https://accounts.spotify.com/authorize?' + (new URLSearchParams(spotifyAPIVals)).toString();

    return NextResponse.redirect(spotifyURL);
}