import { JSONSchemaType } from "ajv";
import { Validator } from "./handlers/validator.js";
import { Action, buildActionSchema } from "./action.js";
import { EventProvider } from "./event_provider.js";
import { InGameInfo, Player } from "./player.js";
import { Connection } from "./connection.js";
import { PlayerLeaveData, playerLeaveDataSchema } from "./server_types.js";
import { GMEventContext } from "./modes/game_mode.js";
import { TokenManager } from "../shared/tokens/token_manager.js";
import { PlayerTokenData } from "../shared/shared_types.js";

interface PlayerJoinData {
    token: string;
}

const playerJoinSchema: JSONSchemaType<PlayerJoinData> = {
    type: "object",
    properties: {
        token: { type: "string" }
    },
    required: ["token"]
};

interface PromiseFns {
    resolve: (value: Player) => void;
    reject: (reason?: any) => void;
}

export class ConnectionHandler {
    private eventProvider: EventProvider<GMEventContext>;
    private validator: Validator<GMEventContext>;
    private conPromises: Map<Connection, PromiseFns>;
    private tokenManager: TokenManager;
    
    constructor(eventProvider: EventProvider<GMEventContext>, tokenManager: TokenManager) {
        this.eventProvider = eventProvider;
        this.tokenManager = tokenManager;

        this.conPromises = new Map();

        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("player_join", playerJoinSchema),
            handler: (data, context) => this.onPlayerJoin(data, context),
        });

        this.validator.addPair({
            schema: buildActionSchema("player_leave", playerLeaveDataSchema),
            handler: (data, context) => this.onPlayerLeave(data, context),
        });

        this.eventProvider.onAction((action: Action<object>, context: GMEventContext) => {
            this.validator.validateAndHandle(action, context);
        });
    }

    onPlayerJoin(action: Action<PlayerJoinData>, context: GMEventContext) {
        if (context.source === undefined) {
            throw new Error("Invalid player_join event context: context.sender is null!");
        }

        const joinData: PlayerJoinData = action.data;
        const con = context.source.con;

        // Finally, resolve the promise for this user
        const fns = this.conPromises.get(con);
        if (fns === undefined) {
            throw new Error("Attempting to complete handshake with unknown User object!");
        }

        // Exchange the user's token to determine if they are the host and get their username
        const userTokenData: PlayerTokenData | undefined = this.tokenManager.exchangeToken(joinData.token);
        if (userTokenData === undefined) {
            throw new Error("Invalid user token data!");
        }

        try {
            const player: Player = new Player({
                ...userTokenData,
                isActiveVoter: false
            } satisfies InGameInfo, con);
            
            player.isHost ? 
                console.log('Added host!') : 
                console.log(`Added player '${player.username}'`);

            // Send a welcome message to the new user with game info
            const welcomeMsg = {
                action: 'welcome',
                data: {
                    role: player.isHost ? 'host' : 'player',
                    game_mode: context.gameMode,
                    player_name: player.username, 
                }
            };

            con.sendAction(welcomeMsg);

            // Resolve the promise so the caller knows the handshake is complete
            fns.resolve(player);

        } catch (e) {
            fns.reject(e);
        }
    }

    private onPlayerLeave(action: Action<PlayerLeaveData>, context: GMEventContext) {
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