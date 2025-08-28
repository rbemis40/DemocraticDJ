import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";

export default function PlayerLobby(props: UIProps) {
    const [userList, setUserList] = useState<string[]>([]);

    useServerMsg((serverMsg) => {
        switch(serverMsg.type) {
            case 'user_list':
                setUserList(serverMsg.user_names);
                break;
        }
    }, ['user_list']);

    useSendModeChanged('lobby', props.sendMsg);

    return (
        <>
            <h1>You are a player.</h1>
            <h1>Users:</h1>
            {userList.map((username, i) => <h2 key={i}>{username}</h2>)}
        </>
    );
}