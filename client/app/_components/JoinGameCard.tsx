import styles from "./JoinGameCard.module.css";

export default function JoinGameCard() {
  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={styles.textCenter}>
        <p className={styles.label}>
          Join a session
        </p>
        <p className={`neon-text-magenta ${styles.title}`}>
          Hit the Floor
        </p>
      </div>

      <form action={`${process.env.NEXT_PUBLIC_URL}/join`} className={styles.form}>
        <input
          type="text"
          className={styles.input}
          placeholder="Game ID"
          maxLength={6}
          name="game_id"
        />
        <input
          type="text"
          className={styles.input}
          placeholder="Username"
          maxLength={20}
          name="name"
        />

        <button className={styles.button}>
          Join Game
        </button>
      </form>
    </div>
  );
}
