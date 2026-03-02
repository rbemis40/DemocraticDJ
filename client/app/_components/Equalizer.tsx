import styles from "./Equalizer.module.css";

export default function Equalizer() {
  return (
    <div className={styles.equalizer}>
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
    </div>
  );
}
