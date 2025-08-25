import { cookies } from "next/headers";
import GameUI from "./game_ui";

// This page will be the page that displays the actual content for the game (host vs player)
export default async function JoinedGame({params} : {params: Promise<{id: number}>}) {
    const { id } = await params;
    const cookieStore = await cookies();
    const game_id = cookieStore.get('game_id');
    const user_token = cookieStore.get('user_token');
    const server_url = cookieStore.get('server_url');
    
    // TODO: Do proper checking here
    return (
        <GameUI game_id={Number.parseInt(game_id!.value)} user_token={user_token!.value} server_url={server_url!.value}></GameUI>
    );
}