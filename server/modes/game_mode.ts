import { User } from "../game_server/user";
import { Action, buildActionSchema } from "../game_server/action";
import { PlayerList } from "../game_server/player_list";
import { Validator } from "../handlers/validator";
import { EventProvider } from "../game_server/event_provider";
import { typeSafeBind } from "../utils";
import { SpotifyManager } from "../spotify/spotify_manager";

export type ServerContext = {
    sender: User | null,
    all: PlayerList,
    eventProvider: EventProvider,
    songManager: SpotifyManager,
}

/**
 * Provides the basic interface for each game mode including the mode's name for server / client messages,
 * as well as the framework for requesting action handlers
 * @param T - The action data types that the game mode accepts
 */
export abstract class GameMode {
    protected name: string;
    protected validator: Validator<ServerContext>;

    constructor(name: string) {
        this.name = name;
        this.validator = new Validator();

        this.validator.addPair({
            schema: buildActionSchema("joined_mode", {
                type: "object"
            }),
            handler: typeSafeBind(this.handleJoinMode, this)
        })
    }

    getName(): string {
        return this.name;
    }

    /**
     * Handles an action by validating it against validator schema, and calling appropriate handler methods for the action.
     * Returns a new state that should be transitioned to, or the current state for no transition.
     * @param action - The action to be handled
     * @param sendingPlayer - The player who sent / initiated this action
     * @param allPlayers - All of the players currently in the game
     * @returns GameMode - The GameMode that should be transitioned to
     */
    handleAction(action: Action<object>, sender: User | null, allPlayers: PlayerList, eventProvider: EventProvider, songManager: SpotifyManager) {
        this.validator.validateAndHandle(action, {
            sender: sender,
            all: allPlayers,
            eventProvider: eventProvider,
            songManager: songManager
        } satisfies ServerContext);
    }

    /**
     * Called when a user first joins the mode. Should send the user the appropriate state necessary to synchronize, and inform
     * other players if necessary.
     * @param data - The join mode action
     * @param context - Includes information such as who has just joined the mode and all of the other players
     */
    protected abstract handleJoinMode(data: Action<object>, context: ServerContext): void;
}