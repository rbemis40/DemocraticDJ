'use client';

import { useEffect, useState } from "react";
import HostUI from "./host_ui";
import PlayerUI from "./player_ui";

interface GameInfoProps {
    game_id: number;
    user_token: string;
    server_url: string;
};

export default function GameClient(props: GameInfoProps) {
    const [userList, setUserList] = useState<string[]>([]);
    const [isHost, setIsHost] = useState<boolean>(false);
    const [ws, setWs] = useState<WebSocket | undefined>();

    // Allows child components to communicate with the game server when necessary
    function sendMsg(msg: string) {
        ws?.send(msg);
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
                default:
                    console.log(`Unknown server msg: \n`);
                    console.log(serverMsg);
                    break;
            }
        });

        ws.addEventListener('close', (e) => {
            console.log(`Closing connection to game server`);
            ws.close();
        });
    }, [ws]);

    return (
        isHost ? <HostUI sendMsg={sendMsg} userList={userList} gameId={props.game_id}/> : <PlayerUI sendMsg={sendMsg} userList={userList}/>
    );
}