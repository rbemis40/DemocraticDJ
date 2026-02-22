import GlowBox from "./_components/glowbox/glowbox";
import styles from "./styles.module.css";
import { mainTheme } from "./_theme/maintheme";
import Tabbed from "./_components/tabbed/tabbed";
import CreateGameBox from "./_components/creategamebox";
import JoinGameBox from "./_components/joingamebox";

export default function Home() {
  return ( 
    <div>
      <div className={styles.logo}>
        {/* <img src="https://as2.ftcdn.net/jpg/03/24/93/31/1000_F_324933141_WgPQPeuxUOW2RhXNZx6iTz9AyLFz2rKP.jpg" className={styles.wall}></img> */}
        <img src="/logo/sign.svg"></img>
      </div>
      <div className={styles.container}>
        <Tabbed tabs={[
          ["Create", <div className={styles.tabBox}><CreateGameBox/></div>],
          ["Join", <div className={styles.tabBox}><JoinGameBox/></div>],
        ]}/>
      </div>
    </div>
  );
}
