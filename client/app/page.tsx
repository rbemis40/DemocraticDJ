export default function Home() {
  return ( 
    <div>
      <form action={`http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/join`}>
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
        <form action={`http://${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_PORT}/create`}>
            <label htmlFor="createGame">Create Game</label>
            <button id="createGame">Create</button>
        </form>
    </div>
  );
}
