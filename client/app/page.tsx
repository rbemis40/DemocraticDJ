import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return ( 
    <div>
      <form action="/join">
            <label htmlFor="id">Join Game</label>
            <input
                id="id"
                name="id"
            />
            <button id="joinButton">Join</button>
        </form>
        <form action="/create">
            <label htmlFor="createGame">Create Game</label>
            <button id="createGame">Create</button>
        </form>

        <script>
            console.log('hello!');
            const socket = new WebSocket('ws://localhost:80')
        </script>
    </div>
  );
}
