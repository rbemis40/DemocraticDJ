export default function PlayerUI(props: UIProps) {
    return (
        props.gameState === 'voting' ?
        <>
            <h1>You are seeing the voting screen as a player!</h1>
        </>
        :
        <>
            <h1>You are a player.</h1>
            <h1>Users:</h1>
            {props.userList.map((username, i) => <h2 key={i}>{username}</h2>)}
        </>
    );
}