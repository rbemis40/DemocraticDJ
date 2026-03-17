"use client";

import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { PlayerData, ServerMsg } from "../../_types/server_msg";
import { UIProps } from "../../types";

import styles from "./HostSelectVoters.module.css";
import Countdown from "../Countdown";

interface VoterListData {
    voter_list: {
        username: string;
        playerId: string;
    }[];
}

interface TimerUpdateData {
    timer_expires: number;
}

export default function HostSelectVoters(props: UIProps) {
    const [timeRem, setTimeRem] = useState<number>(10000);
    const [voterList, setVoterList] = useState<PlayerData[]>([]);

    useServerMsg((msg: ServerMsg) => {
        switch (msg.action) {
            case "voter_list": {
                const data = msg.data as VoterListData;
                setVoterList(data.voter_list);
                break;
            }
            case "timer_update": {
                const data = msg.data as TimerUpdateData;
                setTimeRem(data.timer_expires - Date.now());
                break;
            }
        }
    }, ["voter_list", "timer_update"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return (
        <div className={styles.container}>
            <Countdown initTime={timeRem}/>
            
        </div>
    );
}