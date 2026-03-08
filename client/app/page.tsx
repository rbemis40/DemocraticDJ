import Link from "next/link";
import AmbientBackground from "./_components/AmbientBackground";
import Logo from "./_components/Logo";
import NeonDivider from "./_components/NeonDivider";
import CreateGameCard from "./_components/CreateGameCard";
import JoinGameCard from "./_components/JoinGameCard";
import styles from "./page.module.css";
import ErrorBanner from "./_components/ErrorBanner";

export default function Home() {
  return (
    <div className={styles.container}>
      <AmbientBackground />

      <Logo />

      <NeonDivider />

      {/* Action cards */}
      <div className={styles.cardsWrapper}>
        <CreateGameCard />

        <JoinGameCard />
      </div>

      <ErrorBanner text={`Error: Failed to join game! Please try again.`} autoCloseInterval={3}/>

      <footer className={styles.footer}>
        <Link href="/about">
          <button className="neon-btn-outline">About DemocraticDJ</button>
        </Link>
      </footer>
    </div>
  );
}
