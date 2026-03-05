import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";
import { NewPlayerData, ServerMsg, UserListData } from "../../_types/server_msg";

import styles from "./PlayerLobby.module.css";
import NeonDivider from "@/app/_components/NeonDivider";

interface PlayerLobbyProps extends UIProps {
    playerName: string;
}

export default function PlayerLobby(props: PlayerLobbyProps) {
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
        <div className={styles.container}>
            <h1>
                <span className={`neon-text-cyan`}>You have joined the game as </span>
                <span className={`neon-text-magenta`}>{props.playerName}</span>
            </h1>
            <NeonDivider/>
            <p className={`text-spaced`}>Waiting for the game to start</p>
        </div>
    );
}