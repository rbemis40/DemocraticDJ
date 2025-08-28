import { useEffect, useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";

export default function PlayerVoting(props: UIProps) {
    const [voteCount, setVoteCount] = useState<{[name: string]: number}>({});
    useServerMsg((serverMsg) => {
        switch(serverMsg.type) {
            case 'vote_count':
                setVoteCount(serverMsg.count);
               break;
        }
    }, ['vote_count']);

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
                <div>
                    <h2>{curUser}({voteCount[curUser]})</h2>
                    <button onClick={() => sendVote(curUser)}>Vote</button>
                </div>
            )}
        </>
    );
}