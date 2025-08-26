export default function PlayerUI(props: UIProps) {
    return (
        <>
            <h1>You are a player.</h1>
            <h1>Users:</h1>
            {props.userList.map((username, i) => <h2 key={i}>{username}</h2>)}
        </>
    );
}