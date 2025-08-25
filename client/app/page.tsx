import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return ( 
    <div>
      <form action="/join">
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
        <form action="/create">
            <label htmlFor="createGame">Create Game</label>
            <button id="createGame">Create</button>
        </form>
    </div>
  );
}
