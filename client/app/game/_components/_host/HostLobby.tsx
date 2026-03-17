import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";
import { NewPlayerData, PlayerData, ServerMsg, UserListData } from "../../_types/server_msg";

import styles from "./HostLobby.module.css";
import NeonDivider from "@/app/_components/NeonDivider";

interface HostLobbyProps extends UIProps {
    gameId: number;
};


export default function HostLobby(props: HostLobbyProps) {
    const [userList, setUserList] = useState<PlayerData[]>([]);

    useServerMsg((serverMsg: ServerMsg) => {
        switch (serverMsg.action) {
            case 'user_list':
                const userListData = serverMsg.data as UserListData;
                setUserList(userListData.user_list);
                break;
        }
    }, ['user_list']);

    useSendModeChanged('lobby', props.sendMsg);

    function removeUser(playerId: string) {
        props.sendMsg(JSON.stringify({
            action: 'remove_player',
            data: {
                playerId: playerId
            }
        }));
    }

    function startGame() {
        // TODO
        props.sendMsg(JSON.stringify({
            action: "start_game",
            data: {}
        }));
    }

    return (
        <div className={styles.container}>
            <h1 className={`${styles.heading}`}>
                <span className={`neon-text-cyan`}>Join Using Game ID: </span>
                <span className={`neon-text-magenta`}>{props.gameId}</span>
            </h1>
            <NeonDivider width={`20rem`}/>
            <h1 className={`text-spaced ${styles.playerHeading}`}>Players</h1>
            <div className={styles.playerList}>
            {userList.map((playerData, i) => {
                return (
                    <button key={i} className={`neon-text-cyan ${styles.playerButton}`} onClick={() => removeUser(playerData.playerId)}>{playerData.username}</button>
                );
            })}
            </div>
            <button className={`neon-btn-cyan`} onClick={() => startGame()}>Start Game</button>
        </div>
    );
}