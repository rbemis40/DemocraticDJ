"use client";

import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { PlayerData, ServerMsg } from "../../_types/server_msg";
import { UIProps } from "../../types";

import styles from "./HostSelectVoters.module.css";
import Countdown from "../Countdown";
import { SpotifySearchResult } from "../../_types/spotify_types";

interface VoterListData {
    voter_list: {
        username: string;
        playerId: string;
    }[];
}

interface TimerUpdateData {
    timer_expires: number;
}

interface SongChosenData {
    username: string;
    track: SpotifySearchResult;
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
            case "song_chosen": {
                const data = msg.data as SongChosenData;
                break;
            }
        }
    }, ["voter_list", "timer_update", "song_chosen"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return (
        <div className={styles.container}>
            <Countdown initTime={timeRem}/>
            
        </div>
    );
}