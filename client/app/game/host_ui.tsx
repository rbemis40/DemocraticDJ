export default function HostUI(props: HostProps) {
    return (
        <>
            <h1>You are a host.</h1>
            <h1>Join the game using {props.gameId}</h1>
            <h1>Users:</h1>
            {props.userList.map((username, i) => {
                return (
                    <button key={i} onClick={() => {props.sendMsg(JSON.stringify({type: 'remove_user', user_name: username}))}}>{username}</button>
                );
            })}
        </>
    );
}