import { SimpleGameServer } from "./simple_gs";

const tokenSecret = process.env.TOKEN_SECRET;
if (tokenSecret === undefined) {
    throw new Error("Environment var TOKEN_SECRET not set!");
}

const gameIdStr = process.env.GAME_ID;
if (gameIdStr === undefined) {
    throw new Error("Environment var GAME_ID not set!");
}

let gameId = Number.parseInt(gameIdStr, 10);
const gameServer = new SimpleGameServer(gameId, tokenSecret);