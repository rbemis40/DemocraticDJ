export default function CreateGameBox() {
    return (
        <form action={`${process.env.NEXT_PUBLIC_URL}/create/`}>
            <label htmlFor="createGame">Create Game</label>
            <button id="createGame">Create</button>
        </form>
    );
}