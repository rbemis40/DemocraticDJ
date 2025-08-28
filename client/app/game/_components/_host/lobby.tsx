import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";

interface HostLobbyProps extends UIProps {
    gameId: number;
};

export default function HostLobby(props: HostLobbyProps) {
    const [userList, setUserList] = useState<string[]>([]);

    useServerMsg((serverMsg: any) => {
        switch (serverMsg.type) {
            case 'user_list':
                setUserList(serverMsg.user_names);
                break;
        }
    }, ['user_list']);

    useSendModeChanged('lobby', props.sendMsg);

    function removeUser(name: string) {
        props.sendMsg(JSON.stringify({
            type: 'remove_user',
            user_name: name
        }));
    }

    function startGame() {
        props.sendMsg(JSON.stringify({
            type: 'start_game'
        }));
    }

    return (
        <>
            <h1>You are the host.</h1>
            <h1>Join the game using {props.gameId}</h1>
            <button onClick={() => startGame()}>Start Game!</button>
            <h1>Users:</h1>
            {userList.map((username, i) => {
                return (
                    <button key={i} onClick={() => removeUser(username)}>{username}</button>
                );
            })}
        </>
    );
}