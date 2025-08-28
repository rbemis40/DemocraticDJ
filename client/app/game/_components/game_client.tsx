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
    const [userList, setUserList] = useState<string[]>([]);
    const [isHost, setIsHost] = useState<boolean>(false);
    const [ws, setWs] = useState<WebSocket | undefined>();
    const [gameState, setGameState] = useState<string>('lobby');
    const router = useRouter();
    const [smTrigger] = useContext(ServerMsgContext);

    // Allows child components to communicate with the game server when necessary
    function sendMsg(msg: string) {
        ws?.send(msg);
    }

    function getUIPage() {
        if (isHost) {   
            switch (gameState) {
                case 'lobby':
                    return <HostLobby sendMsg={sendMsg} userList={userList} gameId={props.game_id}/>
                case 'voting':
                    return <HostVoting sendMsg={sendMsg} userList={userList}/>
            }
        }
        else {
            switch (gameState) {
                case 'lobby':
                    return <PlayerLobby sendMsg={sendMsg} userList={userList}/>
                case 'voting':
                    return <PlayerVoting sendMsg={sendMsg} userList={userList}/>
            }
        }
    }

    // Connect to game server
    useEffect(() => {
        let newWs = new WebSocket(props.server_url);
        setWs(newWs);
        
        return () => {newWs.close()};
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
                type: 'auth',
                user_token: props.user_token
            }));
        });

        ws.addEventListener('message', (e) => {
            const serverMsg = JSON.parse(e.data);
            console.log(serverMsg);
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
            case 'user_list':
                console.log(`Received user list: \n${serverMsg.user_names}`);
                setUserList(serverMsg.user_names);
                break;
            case 'new_user':
                console.log(`New user joined: ${serverMsg.user_name}`);
                setUserList(curList => [...curList, serverMsg.user_name]);
                break;
            case 'user_left':
                console.log(`User "${serverMsg.user_name}" has left`);
                setUserList(curList => curList.filter(curUser => curUser !== serverMsg.user_name));
                break;
            case 'promotion':
                setIsHost(true);
                break;
            case 'state_change':
                setGameState(serverMsg.state_name);
                break;
        }
    }, ['user_list', 'new_user', 'user_left', 'promotion', 'state_change']);

    return getUIPage();
}