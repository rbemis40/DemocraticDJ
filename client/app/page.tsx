import styles from "./styles.module.css";

export default function Home() {
  return ( 
    <div className={styles.wall}>
      <div className={styles.logo}>
        <img src="/logo/sign.svg"></img>
      </div>
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
      <form action={`${process.env.NEXT_PUBLIC_URL}/create/`}>
          <label htmlFor="createGame">Create Game</label>
          <button id="createGame">Create</button>
      </form>
    </div>
  );
}
