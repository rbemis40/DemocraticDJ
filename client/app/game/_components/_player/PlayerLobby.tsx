import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";

import styles from "./PlayerLobby.module.css";
import NeonDivider from "@/app/_components/NeonDivider";

interface PlayerLobbyProps extends UIProps {
    playerName: string;
}

export default function PlayerLobby(props: PlayerLobbyProps) {
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