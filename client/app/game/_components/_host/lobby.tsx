import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";
import { NewPlayerData, ServerMsg, UserListData } from "../../_types/server_msg";

interface HostLobbyProps extends UIProps {
    gameId: number;
};

export default function HostLobby(props: HostLobbyProps) {
    const [userList, setUserList] = useState<string[]>([]);

    useServerMsg((serverMsg: ServerMsg) => {
        switch (serverMsg.action.name) {
            case 'user_list':
                const userListData = serverMsg.action.data as UserListData;
                setUserList(userListData.user_list);
                break;
            case 'new_player':
                const newPlayerData = serverMsg.action.data as NewPlayerData;
                setUserList(userList.concat([newPlayerData.username]));
                console.log('hello!');
                break;
        }
    }, ['user_list', 'new_player']);

    useSendModeChanged('lobby', props.sendMsg);

    function removeUser(name: string) {
        props.sendMsg(JSON.stringify({
            type: 'remove_user',
            user_name: name
        }));
    }

    function startGame() {
        // TODO
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