import GlowBox from "./_components/glowbox/glowbox";
import styles from "./styles.module.css";
import { mainTheme } from "./_theme/maintheme";
import UIBox from "./_components/uibox/uibox";
import UIButton from "./_components/uibutton/uibutton";
import GlassBox from "./_components/glassbox/glassbox";

export default function Home() {
  return ( 
    <div className={styles.mainContainer}>
      <div className={styles.logo}>
        <img src="/logo/sign.svg" className={styles.logoImg}></img>
      </div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.actions}>
            <GlowBox highlight={mainTheme.colors.cyanHighlight} glow={mainTheme.colors.cyanGlow}>
              <div className={styles.formContainer}>
                <form action={`${process.env.NEXT_PUBLIC_URL}/create/`} className={styles.formStyle}>
                  <h2>Create Game</h2>
                  <UIButton id="createGame">Create</UIButton>
                </form>
              </div>
            </GlowBox>
            <GlowBox highlight={mainTheme.colors.pinkHighlight} glow={mainTheme.colors.pinkGlow}>
              <div className={styles.formContainer}>
                <form action={`${process.env.NEXT_PUBLIC_URL}/join`} className={styles.formStyle}>
                  <h2>Join Game</h2>
                  <input
                  id="game_id"
                  name="game_id"
                  />
                  <label htmlFor="name">Name</label>
                  <input
                  id="name"
                  name="name"
                  />
                  <UIButton id="joinButton">Join</UIButton>
                </form>
              </div>
            </GlowBox>
          </div>
          <div className={styles.textContainer}>
            <GlassBox>
                <p>Democratic DJ is</p>
            </GlassBox>
          </div>
        </div>
      </div>
    </div>
  );
}
