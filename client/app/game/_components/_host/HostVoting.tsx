import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg } from "../../_types/server_msg";
import { SpotifySearchResult } from "../../_types/spotify_types";
import { UIProps } from "../../types";
import SongCard from "../SongCard";
import Countdown from "../Countdown";
import NeonDivider from "@/app/_components/NeonDivider";

import styles from "./HostVoting.module.css";

type VoterChoice = {
    voter: { username: string; playerId: string };
    track: SpotifySearchResult;
};

type VoterChoicesData = {
    choices: VoterChoice[];
};

type TimerUpdateData = {
    timer_expires: number;
};

type VoteUpdateData = {
    votes: { voter_id: string; vote_count: number }[];
};

export default function HostVoting(props: UIProps) {
    const [timerVal, setTimerVal] = useState<number>(30000);
    const [voterChoices, setVoterChoices] = useState<VoterChoice[]>([]);
    const [voteTally, setVoteTally] = useState<{ voter_id: string; vote_count: number }[]>([]);

    useServerMsg((msg: ServerMsg) => {
        switch (msg.action) {
            case "voter_choices": {
                const data = msg.data as VoterChoicesData;
                setVoterChoices(data.choices);
                break;
            }
            case "timer_update": {
                const data = msg.data as TimerUpdateData;
                setTimerVal(data.timer_expires - Date.now());
                break;
            }
            case "vote_update": {
                const data = msg.data as VoteUpdateData;
                setVoteTally(data.votes);
                break;
            }
        }
    }, ["voter_choices", "timer_update", "vote_update"]);

    useSendJoinedMode("voting_mode", props.sendMsg);

    const maxVotes = Math.max(1, ...voteTally.map(v => v.vote_count));

    return (
        <div className={styles.container}>
            <Countdown initTime={timerVal} />
            <h1 className={`neon-text-cyan ${styles.heading}`}>Vote now!</h1>
            <NeonDivider />
            <div className={styles.choiceList}>
                {voterChoices.map((choice) => {
                    const tally = voteTally.find(v => v.voter_id === choice.voter.playerId);
                    const voteCount = tally?.vote_count ?? 0;
                    const barPct = (voteCount / maxVotes) * 100;

                    return (
                        <div key={choice.voter.playerId} className={styles.choiceRow}>
                            <div className={styles.songInfo}>
                                <div className={styles.songCardWrap}>
                                    <SongCard info={choice.track} />
                                </div>
                                <p className={`neon-text-magenta ${styles.voterName}`}>{choice.voter.username}</p>
                            </div>
                            <div className={styles.barTrack}>
                                <div className={styles.barFill} style={{ width: `${barPct}%` }} />
                                <span className={styles.voteCount}>{voteCount}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
