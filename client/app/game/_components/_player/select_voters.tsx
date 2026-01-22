import { useRef, useState } from "react";
import useSendJoinedMode from "../../_hooks/send_joined_mode";
import useServerMsg from "../../_hooks/server_msg_hook";
import { ServerMsg, SongSelectedData, VoteInfo, VoterStateData } from "../../_types/server_msg";
import { UIProps } from "../../types";
import { SpotifySearchResult } from "../../_types/spotify_types";
import SongCard from "../song_card/song_card";
import useTimer from "../../_hooks/timer_hook";

type UIVoteState = {
    [username: string]: SpotifySearchResult | undefined;
}

export default function PlayerSelectVoters(props: UIProps) {
    const [voteInfo, setVoteInfo] = useState<UIVoteState>({});
    const [timeRem, setTimeRem] = useState<number | undefined>();
    const startTimer = useTimer((newTime) => setTimeRem(newTime));

    useServerMsg((msg: ServerMsg) => {
        switch(msg.action) {
            case "voter_mode_state":
                const stateData = msg.data as VoterStateData;
                setVoteInfo(stateData.voters.reduce((obj, info) => {
                    obj[info.username!] = info.choice;
                    return obj;
                }, {} as UIVoteState));
                startTimer(stateData.timeRem, 0);
                break;
            case "song_selected":
                const selectData = msg.data as SongSelectedData;
                const newObj = {...voteInfo};
                newObj[selectData.username] = selectData.song_data;

                setVoteInfo(newObj);
                break;
        }
    }, ["voter_mode_state", "song_selected"]);

    useSendJoinedMode("select_voters", props.sendMsg);

    return (
    <div>
        <h1>Voters:</h1>
        <h2>Voting ends in {timeRem} seconds...</h2>
        {Object.keys(voteInfo).map(username => 
            <div key={username}>
                <h2>{username}</h2>
                {voteInfo[username] && <SongCard info={voteInfo[username]}/>}
            </div>
        )}
    </div>
    );
}