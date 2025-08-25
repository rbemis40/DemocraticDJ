'use client';

import { useEffect, useState } from "react";

interface GameInfoProps {
    game_id: number;
    user_token: string;
    server_url: string;
};

export default function GameUI(props: GameInfoProps) {
    const [userList, setUserList] = useState<string[]>([]);

    // Connect to game server
    useEffect(() => {
        // Send the user token using the Sec-WebSocket-Protocol header, 
        // as suggested here https://stackoverflow.com/questions/4361173/http-headers-in-websockets-client-api
        console.log(`GameUI props:`);
        console.log(props);
        const ws = new WebSocket(props.server_url);
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

        return () => ws.close();
    }, []);

    console.log('Current user list:');
    console.log(userList);

    return (
        <div>
            <h1>You have joined a game with info: </h1>
            <h2>Game Id: {props.game_id}</h2>
            <h2>User Token: {props.user_token}</h2>
            <h2>Server URL: {props.server_url}</h2>

            <h1>Users:</h1>
            {userList.map((username, i) => <h2 key={i}>{username}</h2>)}
        </div>
    );
}