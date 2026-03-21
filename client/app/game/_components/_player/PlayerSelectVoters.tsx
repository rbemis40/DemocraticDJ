import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg, SongSelectedData, SongSelectOverData, VoterStateData } from "../../_types/server_msg";
import { UIProps } from "../../types";
import { SpotifySearchResult } from "../../_types/spotify_types";
import SongCard from "../SongCard";
import Countdown from "../Countdown";
import SpotifySearch from "../SpotifySearch";
import NeonDivider from "../../../_components/NeonDivider";

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
    const [songChoice, setSongChoice] = useState<SpotifySearchResult | undefined>(undefined);

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

    function onSongChoice(choice: SpotifySearchResult) {
        setSongChoice(choice);
    }

    return (
    <div className={styles.container}>
        <div className={styles.content}>
            <Countdown initTime={timerVal}></Countdown>
            <div className={styles.mainContent}>
                {!songChoice ?
                    <h1>
                        <span className="neon-text-cyan">You are a voter!</span>
                        <span className="neon-text-magenta"> Select your song.</span>
                    </h1>
                    :
                    <>
                        <h1 className="neon-text-cyan">You have selected:</h1>
                        <NeonDivider width="20rem"/>
                        <div className={styles.songCardContainer}>
                            <SongCard info={songChoice} />
                        </div>
                    </>
                }
            </div>
        </div>
        {isVoter && <SpotifySearch sendMsg={props.sendMsg} onChoice={(choice) => onSongChoice(choice)}/>}
    </div>
    );
}