import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";

export default function HostVoting(props: UIProps) {
    const [voteCount, setVoteCount] = useState<{[name: string]: number}>({});
    
    useServerMsg((serverMsg: any) => {
        switch (serverMsg.type) {
            case 'vote_count':
                setVoteCount(serverMsg.count);
                break;
        }
    }, ['vote_count']);

    useSendModeChanged('voting', props.sendMsg);

    return (
        <>
            {
                Object.keys(voteCount).map((name) => {
                    return <h2>{name} has {voteCount[name]} votes</h2>;
                })
            }
        </>
    );
}