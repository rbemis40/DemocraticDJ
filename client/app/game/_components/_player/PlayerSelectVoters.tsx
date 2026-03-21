import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg, SongSelectedData, SongSelectOverData, VoterStateData } from "../../_types/server_msg";
import { UIProps } from "../../types";
import { SpotifySearchResult } from "../../_types/spotify_types";
import SongCard from "../SongCard";
import Countdown from "../Countdown";
import SpotifySearch from "../SpotifySearch";

import styles from "./PlayerSelectVoters.module.css";

type UIVoteState = {
    [username: string]: SpotifySearchResult | undefined;
}

type MakeVoterData = {
    isVoter: boolean;
}

type TimerUpdateData = {
    timer_expires: number;
}

export default function PlayerSelectVoters(props: UIProps) {
    const [timerVal, setTimerVal] = useState<number>(30000);
    const [isVoter, setIsVoter] = useState<boolean>(false);

    useServerMsg((msg: ServerMsg) => {
        switch(msg.action) {
            case "make_voter": {
                const data = msg.data as MakeVoterData;
                setIsVoter(data.isVoter);
                break;
            }
            case "time_update": {
                const data = msg.data as TimerUpdateData;
                setTimerVal(data.timer_expires - Date.now());
                break;
            }
        }
    }, ["make_voter", "timer_update"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    function castVote(username: string) {
        props.sendMsg(JSON.stringify({
            action: "vote_cast",
            data: {
                voted_for: username
            }
        }))
    }

    return (
    <div className={styles.container}>
        <Countdown initTime={timerVal}></Countdown>
        {isVoter && <SpotifySearch sendMsg={props.sendMsg}/>}
    </div>
    );
}