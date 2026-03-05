"use client";

import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg, VoterStateData } from "../../_types/server_msg";
import { UIProps } from "../../types";

import styles from "./HostSelectVoters.module.css";
import Countdown from "../Countdown";

export default function HostSelectVoters(props: UIProps) {
    const [timeRem, setTimeRem] = useState<number>(30000);
    const [voterNames, setVoterNames] = useState<string[]>([]);

    useServerMsg((msg: ServerMsg) => {
        switch (msg.action) {
            case "voter_mode_state": {
                const msgData = msg.data as VoterStateData;
                setTimeRem(msgData.timeRem);
                setVoterNames(msgData.voters.map(voter => voter.username));
            }
        }
    }, ["voter_mode_state", "song_selected", "song_select_over", "vote_count", "voting_over"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return (
        <div className={styles.container}>
            <h1>Host Select Voters</h1>
            <Countdown initTime={timeRem}/>
            <div>
                <h2 className={`text-spaced`}>Voters</h2>
                {
                    voterNames.map(name => <p className={`neon-text-cyan`} key={name}>{name}</p>)
                }
            </div>
        </div>
    );
}