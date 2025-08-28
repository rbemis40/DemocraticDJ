interface HostVotingProps extends UIProps {
    userList: string[];
};

export default function HostVoting(props: HostVotingProps) {
    return (
        <>
            {props.userList.map(curUser => 
                <h2>{curUser} has 0 votes</h2>
            )}
        </>
    );
}