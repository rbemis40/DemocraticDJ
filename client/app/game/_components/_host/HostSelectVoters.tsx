"use client";

import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { PlayerData, ServerMsg } from "../../_types/server_msg";
import { UIProps } from "../../types";

import styles from "./HostSelectVoters.module.css";
import Countdown from "../Countdown";
import { SpotifySearchResult } from "../../_types/spotify_types";
import VoterList from "@/app/_components/VoterList";
import NeonDivider from "@/app/_components/NeonDivider";

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
    choice: SpotifySearchResult;
}

interface VoterData {
    [username: string]: SpotifySearchResult | undefined;
}

export default function HostSelectVoters(props: UIProps) {
    const [timeRem, setTimeRem] = useState<number>(10000);
    const [voterData, setVoterData] = useState<VoterData>({});

    useServerMsg((msg: ServerMsg) => {
        switch (msg.action) {
            case "voter_list": {
                const data = msg.data as VoterListData;
                setVoterData(data.voter_list.reduce((curObj: VoterData, playerData) => {
                    curObj[playerData.username] = undefined;
                    return curObj;
                }, {}));
                break;
            }
            case "timer_update": {
                const data = msg.data as TimerUpdateData;
                setTimeRem(data.timer_expires - Date.now());
                break;
            }
            case "song_chosen": {
                const data = msg.data as SongChosenData;
                const newVoterData = {...voterData};
                newVoterData[data.username] = data.choice;
                setVoterData(newVoterData);
                break;
            }
        }
    }, ["voter_list", "timer_update", "song_chosen"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return (
        <div className={styles.container}>
            <Countdown initTime={timeRem}/>
            <div className={styles.mainContent}>
                <h1 className={`neon-text-cyan ${styles.heading}`}>Players are choosing their songs...</h1>
                <NeonDivider/>
                <VoterList voters={Object.keys(voterData).map(username => ({username: username, choice: voterData[username]}))}/>
            </div>
        </div>
    );
}