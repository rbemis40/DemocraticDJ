'use client';

import { useContext, useEffect, useState } from "react";
import HostLobby from "./_components/_host/HostLobby";
import PlayerLobby from "./_components/_player/PlayerLobby";
import { useRouter } from "next/navigation";
import { ServerMsgContext } from "./_components/ServerMsgProvider";
import useServerMsg from "./_hooks/server_msg_hook";
import { ChangeVoterStateData, ModeChangeData, ServerMsg, WelcomeData } from "./_types/server_msg";
import SpotifySearch from "./_components/SpotifySearch";
import SongQueue from "./_components/SongQueue";
import HostSelectVoters from "./_components/_host/HostSelectVoters";
import HostVoting from "./_components/_host/HostVoting";
import PlayerSelectVoters from "./_components/_player/PlayerSelectVoters";
import PlayerVoting from "./_components/_player/PlayerVoting";

import styles from "./GameClient.module.css";
import JoinScreen from "../_components/JoinScreen";

interface GameInfoProps {
    game_id: number;
    user_token: string;
    server_url: string;
};

export default function GameClient(props: GameInfoProps) {
    const [isHost, setIsHost] = useState<boolean>(false);
    const [ws, setWs] = useState<WebSocket | undefined>();
    const [gameMode, setGameMode] = useState<string>('join');
    const [playerName, setPlayerName] = useState<string | undefined>(undefined);
    const router = useRouter();
    const [smTrigger] = useContext(ServerMsgContext);

    // Allows child components to communicate with the game server when necessary
    function sendMsg(msg: string) {
        ws?.send(msg);
    }

    function getUIPage() {
        if (gameMode === 'join') {
            return <JoinScreen/> 
        }

        if (isHost) {   
            switch (gameMode) {
                case 'lobby':
                    return <HostLobby sendMsg={sendMsg} gameId={props.game_id}/>
                case 'select_voters':
                    return <HostSelectVoters sendMsg={sendMsg}/>
                case 'voting_mode':
                    return <HostVoting sendMsg={sendMsg}/>
            }
        }
        else {
            switch (gameMode) {
                case 'lobby':
                    return <PlayerLobby sendMsg={sendMsg} playerName={playerName!}/>
                case 'select_voters':
                    return <PlayerSelectVoters sendMsg={sendMsg}/>
                case 'voting_mode':
                    return <PlayerVoting sendMsg={sendMsg} playerName={playerName!}/>
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

        const onError = () => {
            console.error('A websocket error was encountered!');
        };

        const onOpen = () => {
            console.log(`Websocket connection established to game server ${props.server_url}`);
            // Send the token to authenticate with the server
            ws.send(JSON.stringify({
                action: 'player_join',
                data: {
                    token: props.user_token 
                }
            }));
        };

        const onMessage = async (e: MessageEvent<any>) => {
            const serverMsg: ServerMsg = JSON.parse(await e.data.text());
            console.log(serverMsg);
            smTrigger(serverMsg.action, serverMsg);
        };

        const onClose = () => {
            console.log(`Closing connection to game server`);
            ws.close();
            router.replace(`${process.env.NEXT_PUBLIC_URL}/`);
        }

        ws.addEventListener('error', onError);
        ws.addEventListener('open', onOpen);
        ws.addEventListener('message', onMessage);
        ws.addEventListener('close', onClose);

        return () => {
            ws.removeEventListener("error", onError);
            ws.removeEventListener("open", onOpen);
            ws.removeEventListener("message", onMessage);
            ws.removeEventListener("close", onClose);
        };
    }, [ws, router, smTrigger, props.server_url, props.user_token]);

    useServerMsg((serverMsg: ServerMsg) => {
        console.log(serverMsg);
        switch (serverMsg.action) {
            case 'welcome':
                const welcomeData = serverMsg.data as WelcomeData;
                setGameMode(welcomeData.game_mode);
                setIsHost(welcomeData.role === 'host');
                setPlayerName(welcomeData.player_name);
                break;
            case 'change_mode':
                const modeChangeData = serverMsg.data as ModeChangeData;
                setGameMode(modeChangeData.gamemode);
                break;
        }
    }, ['welcome', 'change_mode']);

    return (
        <div className={styles.container}>
            { getUIPage() }
            { isHost && <SongQueue/> }
        </div>
    )
}