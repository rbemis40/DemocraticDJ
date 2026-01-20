import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";
import { ServerMsg } from "../../_types/server_msg";

export default function PlayerVoting(props: UIProps) {
    const [voteCount, setVoteCount] = useState<{[name: string]: number}>({});
    const [timeRem, setTimeRem] = useState<number | undefined>();

    useServerMsg((serverMsg: ServerMsg) => {
        switch(serverMsg.action) {
        }
    }, []);

    useSendModeChanged('voting', props.sendMsg);

    function sendVote(name: string) {
        props.sendMsg(JSON.stringify({
            type: 'add_vote',
            user_name: name
        }));
    }


    return (
        <>
            {Object.keys(voteCount).map(curUser => 
                <div key={curUser}>
                    {(timeRem !== undefined) ? <h1>{timeRem} seconds...</h1> : undefined}
                    <h2>{curUser}({voteCount[curUser]})</h2>
                    <button onClick={() => sendVote(curUser)}>Vote</button>
                </div>
            )}
        </>
    );
}