import Link from "next/link";
import AmbientBackground from "./_components/AmbientBackground";
import Logo from "./_components/Logo";
import NeonDivider from "./_components/NeonDivider";
import CreateGameCard from "./_components/CreateGameCard";
import JoinGameCard from "./_components/JoinGameCard";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <AmbientBackground />

      <Logo />

      <NeonDivider />

      {/* Action cards */}
      <div className={styles.cardsWrapper}>
        <CreateGameCard />

        {/* Vertical divider */}
        <div className={styles.verticalDivider} />

        <JoinGameCard />
      </div>

      <footer className={styles.footer}>
        <Link href="/about">
          <button className="neon-btn-outline">About DemocraticDJ</button>
        </Link>
      </footer>
    </div>
  );
}
