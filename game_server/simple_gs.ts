import { RawData, WebSocketServer } from "ws";
import { GameId } from "../shared/shared_types";
import { GameModeSequencer } from "./game/game_mode_sequencer";
import { GameServer } from "../shared/shared_types";
import { PlayerLeaveData } from "./server_types";
import { Player } from "./player";
import { Validator } from "./handlers/validator";
import { Action } from "./action";
import { EventProvider } from "./event_provider";
import { SpotifyAPI } from "./spotify/spotify_api";
import { GMEventContext } from "./modes/game_mode";
import { ConnectionHandler } from "./connection_handler";
import { Connection } from "./connection";
import { PlayerList } from "./player_list";
import { SongManager } from "./spotify/song_manager";
import { SongQueue } from "./song_queue";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer implements GameServer {
    private wss: WebSocketServer;
    private url: URL;
    private validator: Validator<GMEventContext>;
    private connectionHandler: ConnectionHandler;
    private gameModeSeq: GameModeSequencer;
    private playerList: PlayerList;
    private eventProvider: EventProvider<GMEventContext>; // Used for internal dispatching of events from game modes
    private spotifyAPI: SpotifyAPI;
    private songManager: SongManager;
    private songQueue: SongQueue;
    private gameId?: GameId;

    constructor(port=8081) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game server running on port ${port}`));
        this.url = new URL(`ws://${process.env.HOST_NAME}:8081`);
        
        // Order matters here. We want the server to be the first to handle events, and GameModes to be last
        this.validator = new Validator();
        this.eventProvider = new EventProvider();
        this.eventProvider.onAction((action, context) => { // Handle internally dispatched events
            this.validator.validateAndHandle(action, context);
        });

        this.connectionHandler = new ConnectionHandler(this.eventProvider);
        this.playerList = new PlayerList(this.eventProvider);

        this.spotifyAPI = new SpotifyAPI();
        this.songManager = new SongManager(this.spotifyAPI, this.eventProvider);
        
        this.songQueue = new SongQueue(this.eventProvider, this.playerList, this.spotifyAPI);
        
        this.gameModeSeq = new GameModeSequencer(this.eventProvider, this.playerList, this.spotifyAPI);

        this.setupServerHandler();
    }

    async createGame(id: GameId, spotifyCode: string): Promise<boolean> {
        if (this.gameId !== undefined) {
            console.error(`Server is already running game with id ${this.gameId}`);
            return false;
        }

        this.gameId = id;
        if (process.env.SPOTIFY_REDIRECT_URI === undefined) {
            throw new Error("Missing environment variable 'SPOTIFY_REDIRECT_URI'!");
        }

        await this.spotifyAPI.connect(spotifyCode, process.env.SPOTIFY_REDIRECT_URI);

        return true;
    }

    async getServerURL(): Promise<URL> {
        return this.url;
    }

    private setupServerHandler() {
        this.wss.on('connection', async (ws, req) => {
            const newCon = new Connection(ws);
            let player: Player | undefined = undefined;
            ws.on('message', (data: RawData) => {
                try {
                    const msgObj = JSON.parse(data.toString());

                    console.log(`SimpleGameServer.setupServerHandler: Received msg: `);
                    console.log(msgObj);

                    // Pass the message to any game server handlers
                    this.eventProvider.dispatchAction(msgObj, {
                        source: {
                            con: newCon,
                            playerData: player
                        },
                        gameMode: this.gameModeSeq.getCurrentModeName()
                    });
                }
                catch (e) {
                    console.error(e);
                }
            });

            ws.on('close', () => {
                if (player?.username === undefined) {
                    return; // TODO
                }

                this.eventProvider.dispatchAction({
                    action: "player_leave",
                    data: {
                        player: player
                    }
                } satisfies Action<PlayerLeaveData>, {
                    source: {
                        con: newCon,
                        playerData: player
                    },
                    gameMode: this.gameModeSeq.getCurrentModeName()
                });
            });

            // Complete the handshake sequence with the new connection
            player = await this.connectionHandler.completeHandshake(newCon); 
            this.playerList.addPlayer(player);
        });
    }
}
