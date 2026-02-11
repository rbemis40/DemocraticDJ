import { MusicService } from "./music_services/music_service.js";
import { MusicServiceFactory } from "./music_services/music_service_factory.js";
import { SimpleGameServer } from "./simple_gs.js";

const tokenSecret = process.env.TOKEN_SECRET;
if (tokenSecret === undefined) {
    throw new Error("Environment var TOKEN_SECRET not set!");
}

const gameIdStr = process.env.GAME_ID;
if (gameIdStr === undefined) {
    throw new Error("Environment var GAME_ID not set!");
}

const serviceName = process.env.MUSIC_SERVICE;
if (serviceName === undefined) {
    throw new Error("Environment var MUSIC_SERVICE not set!");
}

let gameId = Number.parseInt(gameIdStr, 10);

const musicService: MusicService = await new MusicServiceFactory().buildMusicService(serviceName);
const gameServer = new SimpleGameServer(gameId, musicService, tokenSecret);