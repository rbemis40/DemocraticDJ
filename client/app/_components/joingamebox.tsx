export default function JoinGameBox() {
    return (
        <form action={`${process.env.NEXT_PUBLIC_URL}/join`}>
            <label htmlFor="game_id">Join Game</label>
            <input
            id="game_id"
            name="game_id"
            />
            <label htmlFor="name">Name</label>
            <input
            id="name"
            name="name"
            />
            <button id="joinButton">Join</button>
        </form>
    );
}