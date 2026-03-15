import { MusicService } from "./music_services/music_service.js";
import { MusicServiceFactory } from "./music_services/music_service_factory.js";
import { Server } from "./server.js";
import { loadVarsObj } from "../shared/utils/envvars.js";
import { Game } from "./game.js";
import { JWTTokenManager } from "../shared/tokens/token_manager.js";
import { SeqIdProvider } from "./id_provider.js";
import { PlayerFactory } from "./player_factory.js";



const { TOKEN_SECRET, GAME_ID, MUSIC_SERVICE, PORT } = loadVarsObj("TOKEN_SECRET", "GAME_ID", "MUSIC_SERVICE", "PORT", "TOKEN_SECRET");

let gameId = Number.parseInt(GAME_ID, 10);
let port = Number.parseInt(PORT, 10);

const musicService: MusicService = await new MusicServiceFactory().buildMusicService(MUSIC_SERVICE);
const game = new Game();
const tokenManager = new JWTTokenManager(TOKEN_SECRET, "HS256");
const idProvider = new SeqIdProvider();
const playerFactory = new PlayerFactory(tokenManager, idProvider);

const gameServer = new Server(
    port,
    game,
    playerFactory
);