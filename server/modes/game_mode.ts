import { PlayerData } from "../game_server/player";
import { Action, buildActionSchema } from "../game_server/action";
import { PlayerList } from "../game_server/player_list";
import { Validator } from "../handlers/validator";
import { EventProvider } from "../game_server/event_provider";
import { typeSafeBind } from "../utils";
import { SpotifyManager } from "../spotify/spotify_manager";
import { Connection } from "../game_server/connection";

export type ServerContext = {
    sender?: {
        con: Connection,
        playerData?: PlayerData
    },
    allPlayers: PlayerList,
    eventProvider: EventProvider<ServerContext>,
    songManager: SpotifyManager,
    gameModeName: string;
}

/**
 * Provides the basic interface for each game mode including the mode's name for server / client messages,
 * as well as the framework for requesting action handlers
 * @param T - The action data types that the game mode accepts
 */
export abstract class GameMode {
    protected name: string;
    protected eventProvider: EventProvider<ServerContext>;
    protected validator: Validator<ServerContext>;

    constructor(name: string, eventProvider: EventProvider<ServerContext>) {
        this.name = name;

        this.eventProvider = eventProvider;

        // Force each GameMode to handle a player joining the mode, used to send init data for the client
        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("joined_mode", {
                type: "object"
            }),
            handler: (data, context) => this.onJoinMode(data, context)
        });

        // Receive events from the server, and validate them to pass to handlers
        this.eventProvider.onAction((action, context) => {
            this.validator.validateAndHandle(action, context);
        });
    }

    getName(): string {
        return this.name;
    }

    /**
     * Called when a user first joins the mode. Should send the user the appropriate state necessary to synchronize, and inform
     * other players if necessary.
     * @param data - The join mode action
     * @param context - Includes information such as who has just joined the mode and all of the other players
     */
    protected abstract onJoinMode(data: Action<object>, context: ServerContext): void;
}