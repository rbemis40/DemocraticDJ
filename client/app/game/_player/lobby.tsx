interface PlayerLobbyProps extends UIProps {
    userList: string[];
};

export default function PlayerLobby(props: PlayerLobbyProps) {
    return (
        <>
            <h1>You are a player.</h1>
            <h1>Users:</h1>
            {props.userList.map((username, i) => <h2 key={i}>{username}</h2>)}
        </>
    );
}