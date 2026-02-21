import styles from "./styles.module.css";

export default function Home() {
  return ( 
    <div>
      <div className={styles.logo}>
        <img src="https://as2.ftcdn.net/jpg/03/24/93/31/1000_F_324933141_WgPQPeuxUOW2RhXNZx6iTz9AyLFz2rKP.jpg" className={styles.wall}></img>
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
