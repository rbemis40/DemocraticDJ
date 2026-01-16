'use client';

import { useContext, useEffect, useState } from "react";
import HostLobby from "./_host/lobby";
import PlayerLobby from "./_player/lobby";
import { useRouter } from "next/navigation";
import HostVoting from "./_host/voting";
import PlayerVoting from "./_player/voting";
import { ServerMsgContext } from "./server_msg_provider";
import useServerMsg from "../_hooks/server_msg_hook";
import { ModeChangeData, ServerMsg, WelcomeData } from "../_types/server_msg";
import SpotifySearch from "./spotify_search";

interface GameInfoProps {
    game_id: number;
    user_token: string;
    server_url: string;
};

export default function GameClient(props: GameInfoProps) {
    const [isHost, setIsHost] = useState<boolean>(false);
    const [ws, setWs] = useState<WebSocket | undefined>();
    const [gameMode, setGameMode] = useState<string>('join');
    const router = useRouter();
    const [smTrigger] = useContext(ServerMsgContext);

    // Allows child components to communicate with the game server when necessary
    function sendMsg(msg: string) {
        ws?.send(msg);
    }

    function getUIPage() {
        if (gameMode === 'join') {
            return <h1>Joining...</h1>
        }

        if (isHost) {   
            switch (gameMode) {
                case 'lobby':
                    return <HostLobby sendMsg={sendMsg} gameId={props.game_id}/>
                case 'voting':
                    return <HostVoting sendMsg={sendMsg}/>
            }
        }
        else {
            switch (gameMode) {
                case 'lobby':
                    return <PlayerLobby sendMsg={sendMsg}/>
                case 'voting':
                    return <PlayerVoting sendMsg={sendMsg}/>
            }
        }
    }

    // Connect to game server
    useEffect(() => {
        const newWs = new WebSocket(props.server_url);
        setWs(newWs);
        
        return () => {setWs(undefined); newWs.close()};
    }, [props.server_url]);

    // Add event listeners for the websocket
    useEffect(() => {
        if (ws === undefined) {
            return;
        }

        ws.addEventListener('error', () => {
            console.error('A websocket error was encountered!');
        });

        ws.addEventListener('open', () => {
            console.log(`Websocket connection established to game server ${props.server_url}`);
            // Send the token to authenticate with the server
            ws.send(JSON.stringify({
                action: 'player_join',
                data: {
                    token: props.user_token 
                }
            }));
        });

        ws.addEventListener('message', (e) => {
            const serverMsg: ServerMsg = JSON.parse(e.data);
            console.log(serverMsg);
            smTrigger(serverMsg.action, serverMsg);
        });

        ws.addEventListener('close', () => {
            console.log(`Closing connection to game server`);
            ws.close();
            router.replace(`http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/`);
        });
    }, [ws, router, smTrigger, props.server_url, props.user_token]);

    useServerMsg((serverMsg: ServerMsg) => {
        console.log(serverMsg);
        switch (serverMsg.action) {
            case 'welcome':
                const welcomeData = serverMsg.data as WelcomeData;
                setGameMode(welcomeData.gamemode);
                setIsHost(welcomeData.role === 'host');
                break;
            case 'change_mode':
                const modeChangeData = serverMsg.data as ModeChangeData;
                setGameMode(modeChangeData.gamemode);
                break;
        }
    }, ['welcome', 'change_mode']);

    return <>
        <SpotifySearch sendMsg={sendMsg}/> {/* TODO: This should only be shown to a player who is the active voter!!! */}
        {getUIPage()}
    </>
}