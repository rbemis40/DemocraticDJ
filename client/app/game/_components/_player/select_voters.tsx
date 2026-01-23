import { useRef, useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg } from "../../_types/server_msg";
import { UIProps } from "../../types";
import { SpotifySearchResult } from "../../_types/spotify_types";
import SongCard from "../song_card/song_card";
import Countdown from "../countdown";

type UIVoteState = {
    [username: string]: SpotifySearchResult | undefined;
}

interface VoteInfo {
    username: string;
    choice?: SpotifySearchResult;
}

interface VoterStateData {
    voters: VoteInfo[];
    timeRem: number;
    state: string;
}

interface SongSelectedData {
    username: string;
    song_data: SpotifySearchResult;
}

interface SongSelectOverData {
    state: string;
    timeRem: number;
}

export default function PlayerSelectVoters(props: UIProps) {
    const [timerVal, setTimerVal] = useState<number>(30000);
    const [voteInfo, setVoteInfo] = useState<UIVoteState>({});
    const [gameState, setGameState] = useState<string>("");

    useServerMsg((msg: ServerMsg) => {
        switch(msg.action) {
            case "voter_mode_state":
                const stateData = msg.data as VoterStateData;
                setVoteInfo(stateData.voters.reduce((obj, info) => {
                    obj[info.username!] = info.choice;
                    return obj;
                }, {} as UIVoteState));
                setTimerVal(stateData.timeRem);
                setGameState(stateData.state);
                break;
            case "song_selected":
                const selectData = msg.data as SongSelectedData;
                const newObj = {...voteInfo};
                newObj[selectData.username] = selectData.song_data;

                setVoteInfo(newObj);
                break;
            case "song_select_over":
                const selectOverData = msg.data as SongSelectOverData;
                setGameState(selectOverData.state);
                setTimerVal(selectOverData.timeRem);
                break;
        }
    }, ["voter_mode_state", "song_selected", "song_select_over"]);

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
    <div>
        <Countdown initTime={timerVal}></Countdown>
        <h1>State: {gameState}</h1>
        <h1>Voters:</h1>
        {Object.keys(voteInfo).map(username => 
            <div key={username}>
                <h2>{username}</h2>
                {voteInfo[username] && <SongCard info={voteInfo[username]}/>}
                {gameState === "vote" && <button onClick={() => castVote(username)}>Cast Vote</button>}
            </div>
        )}
    </div>
    );
}