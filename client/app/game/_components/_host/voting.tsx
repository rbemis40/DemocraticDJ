import { useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";

interface HostVotingProps extends UIProps {
    userList: string[];
};

export default function HostVoting(props: HostVotingProps) {
    const [counts, setCounts] = useState<{[name: string]: number}>({});
    
    useServerMsg((serverMsg: any) => {
        setCounts(serverMsg.count);
    }, ['vote_count']);

    return (
        <>
            {
                Object.entries(counts).map(([name, votes]) => {
                    return <h2>{name} has {votes} votes</h2>;
                })
            }
        </>
    );
}