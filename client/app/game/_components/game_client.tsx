'use client';

import { useContext, useEffect, useState } from "react";
import HostLobby from "./_host/lobby";
import PlayerLobby from "./_player/lobby";
import { useRouter } from "next/navigation";
import HostVoting from "./_host/voting";
import PlayerVoting from "./_player/voting";
import { ServerMsgContext } from "./server_msg_provider";
import useServerMsg from "../_hooks/server_msg_hook";

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
        let newWs = new WebSocket(props.server_url);
        setWs(newWs);
        
        return () => {setWs(undefined); newWs.close()};
    }, []);

    // Add event listeners for the websocket
    useEffect(() => {
        if (ws === undefined) {
            return;
        }

        console.log(`GameUI props:`);
        console.log(props);
        ws.addEventListener('error', (e) => {
            console.error('A websocket error was encountered!');
        });

        ws.addEventListener('open', () => {
            console.log(`Websocket connection established to game server ${props.server_url}`);
            // Send the token to authenticate with the server
            ws.send(JSON.stringify({
                type: 'user_join',
                user_token: props.user_token
            }));
        });

        ws.addEventListener('message', (e) => {
            const serverMsg = JSON.parse(e.data);
            smTrigger(serverMsg.type, serverMsg);
        });

        ws.addEventListener('close', (e) => {
            console.log(`Closing connection to game server`);
            ws.close();
            router.replace(`http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/`);
        });
    }, [ws]);

    useServerMsg((serverMsg) => {
        switch (serverMsg.type) {
            case 'welcome':
                setGameMode(serverMsg.game_mode);
                setIsHost(serverMsg.role === 'host');
                break;
            case 'mode_change':
                setGameMode(serverMsg.game_mode);
                break;
        }
    }, ['welcome', 'mode_change']);

    return getUIPage();
}