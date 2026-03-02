import styles from "./CreateGameCard.module.css";

export default function CreateGameCard() {
  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={styles.textCenter}>
        <p className={styles.label}>
          Host a session
        </p>
        <p className={`neon-text-cyan ${styles.title}`}>
          Start the Party
        </p>
      </div>
      <form action={`${process.env.NEXT_PUBLIC_URL}/create`}>
        <button className={`neon-btn-cyan ${styles.fullWidth}`}>
          Create Game
        </button>
      </form>
    </div>
  );
}
