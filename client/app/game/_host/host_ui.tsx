export default function HostUI(props: HostProps) {
    function removeUser(name: string) {
        props.sendMsg(JSON.stringify({
            type: 'remove_user',
            user_name: name
        }));
    }

    function startGame() {
        props.sendMsg(JSON.stringify({
            type: 'start_game'
        }));
    }

    return (
        props.gameState === 'voting' ?
        <>
            <h1>You are now seeing the voting screen as the host</h1>
        </>
        :
        <>
            <h1>You are the host.</h1>
            <h1>Join the game using {props.gameId}</h1>
            <button onClick={() => startGame()}>Start Game!</button>
            <h1>Users:</h1>
            {props.userList.map((username, i) => {
                return (
                    <button key={i} onClick={() => removeUser(username)}>{username}</button>
                );
            })}
        </>
    );
}