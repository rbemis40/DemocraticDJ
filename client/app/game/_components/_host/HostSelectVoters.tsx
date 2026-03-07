"use client";

import { useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg, SongSelectedData, SongSelectOverData, VoteCountData, VoterStateData } from "../../_types/server_msg";
import { UIProps } from "../../types";

import styles from "./HostSelectVoters.module.css";
import Countdown from "../Countdown";
import { SpotifySearchResult } from "../../_types/spotify_types";
import SongCard from "../SongCard";
import VoterBarChart from "../VoterBarChart";

interface PlayerVoteState {
    [playerName: string]: {
        song: SpotifySearchResult;
        votes: number;
    };
}

export default function HostSelectVoters(props: UIProps) {
    const [votingState, setVotingState] = useState<string>("none");
    const [timeRem, setTimeRem] = useState<number>(30000);
    const [repNames, setRepNames] = useState<string[]>([]);
    const [songChoices, setSongChoices] = useState<PlayerVoteState>({});

    useServerMsg((msg: ServerMsg) => {
        switch (msg.action) {
            case "voter_mode_state": {
                const msgData = msg.data as VoterStateData;
                setTimeRem(msgData.timeRem);
                setRepNames(msgData.voters.map(voter => voter.username));
                setVotingState(msgData.state);
                break;
            }
            case "song_selected": {
                const msgData = msg.data as SongSelectedData;
                const newChoiceObj = {...songChoices};
                newChoiceObj[msgData.username] = {
                    song: msgData.song_data,
                    votes: 0
                };
                setSongChoices(newChoiceObj);
                break;
            }
            case "song_select_over": {
                const msgData = msg.data as SongSelectOverData;
                setTimeRem(msgData.timeRem);
                setVotingState(msgData.state);
                break;
            }
            case "vote_count": {
                const msgData = msg.data as VoteCountData;
                const voterStateObj = {...songChoices};

                for (const player of msgData.count) {
                    voterStateObj[player.username].votes = player.count;
                }

                setSongChoices(voterStateObj);
            }
        }
    }, ["voter_mode_state", "song_selected", "song_select_over", "vote_count", "voting_over"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return (
        <div className={styles.container}>
            <h1>Host Select Voters</h1>
            <Countdown initTime={timeRem}/>
            <VoterBarChart height="500px" playerInfo={
                repNames.map(name => ({
                    name: name,
                    choice: songChoices[name]?.song,
                    voteCount: songChoices[name]?.votes
                }))
            }/>
        </div>
    );
}