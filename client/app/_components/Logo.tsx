import Equalizer from "./Equalizer";
import styles from "./Logo.module.css";

function RecordIcon() {
  return (
    <div className={styles.recordIcon}>
      <div className={styles.recordIconInner} />
    </div>
  );
}

export default function Logo() {
  return (
    <header className={styles.header}>
      <div className={styles.iconRow}>
        <Equalizer />
        <RecordIcon />
        <Equalizer />
      </div>

      <h1 className={styles.heading}>
        <span className="neon-text-cyan">Democratic</span>
        <span className="neon-text-magenta">DJ</span>
      </h1>

      <p className={`text-spaced`}>
        Where the crowd controls the beat
      </p>
    </header>
  );
}
