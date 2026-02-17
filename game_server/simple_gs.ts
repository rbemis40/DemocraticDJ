import { RawData, WebSocketServer } from "ws";
import { GameId } from "../shared/shared_types.js";
import { GameModeSequencer } from "./game/game_mode_sequencer.js";
import { PlayerLeaveData } from "./server_types.js";
import { Player } from "./player.js";
import { Validator } from "./handlers/validator.js";
import { Action } from "./action.js";
import { EventProvider } from "./event_provider.js";
import { GMEventContext } from "./modes/game_mode.js";
import { ConnectionHandler } from "./connection_handler.js";
import { Connection } from "./connection.js";
import { PlayerList } from "./player_list.js";
import { SongQueue } from "./song_queue.js";
import { JWTTokenManager, TokenManager } from "../shared/tokens/token_manager.js";
import { MusicService } from "./music_services/music_service.js";
import { MusicServiceEventHandler } from "./music_services/music_service_event_handler.js";

/*
    - A game server that simply runs on the same system as the HTTP server
    - TODO: For now, only supports one game at a time
*/
export class SimpleGameServer {
    private wss: WebSocketServer;
    private url: URL;
    private validator: Validator<GMEventContext>;
    private connectionHandler: ConnectionHandler;
    private gameModeSeq: GameModeSequencer;
    private playerList: PlayerList;
    private eventProvider: EventProvider<GMEventContext>; // Used for internal dispatching of events from game modes
    private tokenManager: TokenManager;
    private musicService: MusicService;
    private songQueue: SongQueue;
    private gameId: GameId;

    constructor(gameId: GameId, musicService: MusicService, tokenSecret: string, port=8081) {
        this.url = new URL(`ws://${process.env.HOST_NAME}:8081`);
        this.gameId = gameId;
        
        // Order matters here. We want the server to be the first to handle events, and GameModes to be last
        this.validator = new Validator();
        this.eventProvider = new EventProvider();
        this.eventProvider.onAction((action, context) => { // Handle internally dispatched events
            this.validator.validateAndHandle(action, context);
        });

        this.tokenManager = new JWTTokenManager(tokenSecret, "HS256");
        this.connectionHandler = new ConnectionHandler(this.eventProvider, this.tokenManager);
        this.playerList = new PlayerList(this.eventProvider);

        // Setup the music service and the event handler for it
        this.musicService = musicService;
        new MusicServiceEventHandler(this.musicService, this.eventProvider);
        
        this.songQueue = new SongQueue(this.eventProvider, this.playerList);
        
        this.gameModeSeq = new GameModeSequencer(this.eventProvider, this.playerList, this.musicService);

        this.setupServerHandler(port);
    }

    async getServerURL(): Promise<URL> {
        return this.url;
    }

    private setupServerHandler(port: number) {
        this.wss = new WebSocketServer({port: port}, () => console.log(`Game server running on port ${port}`));
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
                if (player?.username === undefined) { // The host has left the game
                    console.log("The host has left!");
                    
                    this.playerList.getUsernames().forEach((username => {
                        this.playerList.getPlayerByUsername(username)?.getConnection()?.disconnect();
                    }));
                    
                    this.wss.close();
                    return;
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

            // Make sure the username isn't taken
            if (player.username !== undefined && this.playerList.isUsernameTaken(player.username)) {
                player.getConnection().disconnect();
                return;
            }
            
            this.playerList.addPlayer(player);
        });
    }
}
