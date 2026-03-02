'use client';

import { useContext, useEffect, useState } from "react";
import HostLobby from "./_components/_host/lobby";
import PlayerLobby from "./_components/_player/lobby";
import { useRouter } from "next/navigation";
import { ServerMsgContext } from "./_components/server_msg_provider";
import useServerMsg from "./_hooks/server_msg_hook";
import { ChangeVoterStateData, ModeChangeData, ServerMsg, WelcomeData } from "./_types/server_msg";
import SpotifySearch from "./_components/spotify_search";
import SongQueue from "./_components/SongQueue";
import HostSelectVoters from "./_components/_host/select_voters";
import PlayerSelectVoters from "./_components/_player/select_voters";

import styles from "./GameClient.module.css";

interface GameInfoProps {
    game_id: number;
    user_token: string;
    server_url: string;
};

export default function GameClient(props: GameInfoProps) {
    const [isHost, setIsHost] = useState<boolean>(false);
    const [isVoter, setIsVoter] = useState<boolean>(false);
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
                case 'select_voters':
                    return <HostSelectVoters sendMsg={sendMsg}/>
            }
        }
        else {
            switch (gameMode) {
                case 'lobby':
                    return <PlayerLobby sendMsg={sendMsg}/>
                case 'select_voters':
                    return <PlayerSelectVoters sendMsg={sendMsg}/>
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

        ws.addEventListener('error', (err) => {
            console.error('A websocket error was encountered!');
            console.error(err);
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

        ws.addEventListener('message', async (e) => {
            const serverMsg: ServerMsg = JSON.parse(await e.data.text());
            console.log(serverMsg);
            smTrigger(serverMsg.action, serverMsg);
        });

        ws.addEventListener('close', () => {
            console.log(`Closing connection to game server`);
            ws.close();
            router.replace(`${process.env.NEXT_PUBLIC_URL}/`);
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
            case 'change_voter_state':
                const voterChangeData = serverMsg.data as ChangeVoterStateData;
                setIsVoter(voterChangeData.isVoter);
                break;
        }
    }, ['welcome', 'change_mode', 'change_voter_state']);

    return (
        <div className={styles.container}>
            { isVoter && <SpotifySearch sendMsg={sendMsg}/> }
            { isHost && <SongQueue/> }
            { getUIPage() }
        </div>
    )
}