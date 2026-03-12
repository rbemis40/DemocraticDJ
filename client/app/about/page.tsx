import Link from "next/link";
import NeonDivider from "../_components/NeonDivider";
import styles from "./page.module.css";

export default function About() {
  return (
    <div className={styles.container}>
      <div className="scanline" />

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.heading}>
          <span className="neon-text-cyan">About </span>
          <span className="neon-text-magenta">DemocraticDJ</span>
        </h1>
        <p className={`text-spaced`}>
          Where the crowd controls the beat
        </p>
      </header>

      <NeonDivider width="min(500px, 80vw)" />

      {/* About content card */}
      <div className={`glass-card ${styles.contentCard}`}>
        <div>
          <p className={`neon-text-cyan ${styles.sectionLabel}`}>
            What is DemocraticDJ?
          </p>
          <p className={styles.sectionBody}>
            DemocraticDJ is a multiplayer music game where players vote on what
            plays next. No single DJ rules the night — the crowd decides the vibe.
            Submit tracks, cast your votes, and watch the playlist evolve in real time.
          </p>
        </div>

        <div className={styles.inlineDivider} />

        <div>
          <p className={`neon-text-magenta ${styles.sectionLabel}`}>
            How to Play
          </p>
          <ol className={styles.howToPlayList}>
            <li>Create or join a game session</li>
            <li>Submit your track picks each round</li>
            <li>Vote on which song plays next</li>
            <li>The highest-voted track hits the decks</li>
          </ol>
        </div>
      </div>

      {/* Footer CTA */}
      <Link href="/">
        <button className={`neon-btn-cyan ${styles.ctaButton}`}>
          Join the Floor
        </button>
      </Link>
    </div>
  );
}
