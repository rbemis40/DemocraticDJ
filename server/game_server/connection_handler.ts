import { JSONSchemaType } from "ajv";
import { Validator } from "../handlers/validator";
import { ServerContext } from "../modes/game_mode";
import { UserToken } from "../shared_types";
import { Action, buildActionSchema } from "./action";
import { EventProvider } from "./event_provider";
import { InGameInfo, Player } from "./player";
import { TokenData, TokenHandler } from "../handlers/token_handler";
import { Connection } from "./connection";
import { PlayerLeaveData, playerLeaveDataSchema } from "./server_types";

interface PlayerJoinData {
    token: UserToken;
}

const playerJoinSchema: JSONSchemaType<PlayerJoinData> = {
    type: "object",
    properties: {
        token: {type: "string"}
    },
    required: ["token"]
};

interface PromiseFns {
    resolve: (value: Player) => void;
    reject: (reason?: any) => void;
}

export class ConnectionHandler {
    private eventProvider: EventProvider<ServerContext>;
    private validator: Validator<ServerContext>;
    private conPromises: Map<Connection, PromiseFns>;
    
    constructor(eventProvider: EventProvider<ServerContext>) {
        this.eventProvider = eventProvider;
        this.conPromises = new Map();

        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("player_join", playerJoinSchema),
            handler: (data, context) => this.onPlayerJoin(data, context),
        });

        this.validator.addPair({
            schema: buildActionSchema("player_leave", playerLeaveDataSchema),
            handler: (data, context) => this.onPlayerLeave(data, context),
        })

        this.eventProvider.onAction((action: Action<object>, context: ServerContext) => {
            this.validator.validateAndHandle(action, context);
        });
    }

    onPlayerJoin(action: Action<PlayerJoinData>, context: ServerContext) {
        if (context.sender === undefined) {
            throw new Error("Invalid player_join event context: context.sender is null!");
        }

        const joinData: PlayerJoinData = action.data;
        const con = context.sender.con;

        // Finally, resolve the promise for this user
        const fns = this.conPromises.get(con)
        if (fns === undefined) {
            throw new Error("Attempting to complete handshake with unknown User object!");
        }

        try {
            const tokenData: TokenData = TokenHandler.exchangeToken(joinData.token);
            const player: Player = new Player(tokenData satisfies InGameInfo, con);
            
            player.isHost ? 
                console.log('Added host!') : 
                console.log(`Added player '${player.username}'`);

            // Send a welcome message to the new user with game info
            const welcomeMsg = {
                action: 'welcome',
                data: {
                    role: player.isHost ? 'host' : 'player',
                    gamemode: context.gameModeName
                }
            };

            con.sendAction(welcomeMsg);

            // Resolve the promise so the caller knows the handshake is complete
            fns.resolve(player);

        } catch (e) {
            fns.reject(e);
        }
    }

    private onPlayerLeave(action: Action<PlayerLeaveData>, context: ServerContext) {
        const player: Player = action.data.player as Player;
        player.getConnection().disconnect();
    }

    async completeHandshake(con: Connection): Promise<Player> {
        // Create the Promise that will be resolved once the handshake is complete
        return new Promise((resolve, reject) => {
            this.conPromises.set(con, {resolve: resolve, reject: reject}); // Store the promise fns so the promise can be resolved or rejected during the handshake
        });
    }
}