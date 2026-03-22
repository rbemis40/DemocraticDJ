import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg } from "../../_types/server_msg";
import { SpotifySearchResult } from "../../_types/spotify_types";
import { UIProps } from "../../types";
import SongCard from "../SongCard";
import Countdown from "../Countdown";

import styles from "./PlayerVoting.module.css";

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

interface PlayerVotingProps extends UIProps {
    playerName: string;
}

export default function PlayerVoting(props: PlayerVotingProps) {
    const [timerVal, setTimerVal] = useState<number>(30000);
    const [voterChoices, setVoterChoices] = useState<VoterChoice[]>([]);
    const [myVote, setMyVote] = useState<string | null>(null);

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
        }
    }, ["voter_choices", "timer_update", "vote_update"]);

    useSendJoinedMode("voting", props.sendMsg);

    function castVote(voterId: string) {
        setMyVote(voterId);
        props.sendMsg(JSON.stringify({
            action: "cast_vote",
            data: { voter_id: voterId }
        }));
    }

    return (
        <div className={styles.container}>
            <Countdown initTime={timerVal} />
            <h1>
                <span className="neon-text-cyan">Vote for a </span>
                <span className="neon-text-magenta">song!</span>
            </h1>
            <div className={styles.songList}>
                {voterChoices.map((choice) => {
                    const isSelf = choice.voter.username === props.playerName;
                    const isSelected = choice.voter.playerId === myVote;
                    const cardClass = isSelected
                        ? styles.selectedCard
                        : isSelf
                        ? styles.disabledCard
                        : styles.songCard;

                    return (
                        <button
                            key={choice.voter.playerId}
                            className={cardClass}
                            disabled={isSelf}
                            onClick={() => castVote(choice.voter.playerId)}
                        >
                            <SongCard info={choice.track} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
