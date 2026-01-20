import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";
import { NewPlayerData, ServerMsg, UserListData } from "../../_types/server_msg";

export default function PlayerLobby(props: UIProps) {
    const [userList, setUserList] = useState<string[]>([]);

    useServerMsg((serverMsg: ServerMsg) => {
        switch(serverMsg.action) {
            case 'user_list':
                const userListData = serverMsg.data as UserListData
                setUserList(userListData.user_list);
                break;
            case 'new_player':
                const newPlayerData = serverMsg.data as NewPlayerData;
                setUserList(userList.concat([newPlayerData.username]));
                break;
        }
    }, ['user_list', 'new_player']);

    useSendModeChanged('lobby', props.sendMsg);

    return (
        <>
            <h1>You are a player.</h1>
            <h1>Users:</h1>
            {userList.map((username, i) => <h2 key={i}>{username}</h2>)}
        </>
    );
}