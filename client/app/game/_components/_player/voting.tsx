interface PlayerVotingProps extends UIProps {
    userList: string[];
};

export default function PlayerVoting(props: PlayerVotingProps) {
    function sendVote(name: string) {
        props.sendMsg(JSON.stringify({
            type: 'add_vote',
            user_name: name
        }));
    }

    return (
        <>
            {props.userList.map(curUser => 
                <div>
                    <h2>{curUser}</h2>
                    <button onClick={() => sendVote(curUser)}>Vote</button>
                </div>
            )}
        </>
    );
}