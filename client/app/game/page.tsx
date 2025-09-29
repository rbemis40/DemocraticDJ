import { cookies } from "next/headers";
import GameClient from "./_components/game_client";
import ServerMsgProvider from "./_components/server_msg_provider";

// This page must be a server component that reads the cookies in order to establish a connection to the game server (responsibility of GameClient)
export default async function Game() {
    // const { id } = await params;
    const cookieStore = await cookies();
    const game_id = cookieStore.get('game_id');
    const user_token = cookieStore.get('user_token');
    const server_url = cookieStore.get('server_url');
    
    // TODO: Do proper checking here
    return (
        <ServerMsgProvider>
            <GameClient game_id={Number.parseInt(game_id!.value)} user_token={user_token!.value} server_url={server_url!.value}/>
        </ServerMsgProvider>
    );
}