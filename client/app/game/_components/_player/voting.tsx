import { useEffect, useState } from "react";
import useServerMsg from "../../_hooks/server_msg_hook";
import { UIProps } from "../../types";
import useSendModeChanged from "../../_hooks/send_joined_mode";

export default function PlayerVoting(props: UIProps) {
    const [voteCount, setVoteCount] = useState<{[name: string]: number}>({});
    const [timeRem, setTimeRem] = useState<number | undefined>();

    useServerMsg((serverMsg) => {
        switch(serverMsg.type) {
            case 'vote_count':
                setVoteCount(serverMsg.count);
                break;
            case 'begin_countdown':
                console.log('Beginning countdown!');
                setTimeRem(serverMsg.seconds);
                const intId = setInterval(() => {
                    setTimeRem((curTime) => {
                            const newTime = curTime! -= 1;
                            if (newTime === 0) {
                                clearInterval(intId);
                            }

                            return newTime;
                        }
                    );

                }, 1000);
                break;
            case 'end_countdown':
                console.log('End of countdown!');
                setTimeRem(0);
                break;
        }
    }, ['vote_count', 'begin_countdown', 'end_countdown']);

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
                    {(timeRem !== undefined) ? <h1>{timeRem} seconds...</h1> : undefined}
                    <h2>{curUser}({voteCount[curUser]})</h2>
                    <button onClick={() => sendVote(curUser)}>Vote</button>
                </div>
            )}
        </>
    );
}