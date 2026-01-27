import { PlayerData } from "../player";
import { Connection } from "../connection";
import { EventProvider } from "../event_provider";
import { Validator } from "../handlers/validator";
import { Action, buildActionSchema } from "../action";

export interface GMEventContext {
    source?: {
        con: Connection,
        playerData?: PlayerData // This is undefined if the user has connected to the server, but not joined the game yet
    },
    gameMode: string; // The current game mode name
};

/**
 * Provides the basic interface for each game mode including the mode's name for server / client messages,
 * as well as the framework for requesting action handlers
 * @param T - The action data types that the game mode accepts
 */
export abstract class GameMode {
    protected name: string;
    protected eventProvider: EventProvider<GMEventContext>;
    protected validator: Validator<GMEventContext>;
    private eventCallbackId: number;

    constructor(name: string, eventProvider: EventProvider<GMEventContext>) {
        this.name = name;

        this.eventProvider = eventProvider;
        this.eventCallbackId = -1; // Placeholder until the game mode is made active

        // Force each GameMode to handle a player joining the mode, used to send init data for the client
        this.validator = new Validator();
        this.validator.addPair({
            schema: buildActionSchema("joined_mode", {
                type: "object"
            }),
            handler: (data, context) => this.onJoinMode(data, context)
        });

        
    }

    getName(): string {
        return this.name;
    }

    /**
     * Makes the game mode respond to events and respond to player messages by listening to events
     * dispatched by the EventProvider
     */
    makeActive() {
        this.eventCallbackId = this.eventProvider.onAction((action, context) => {
            this.validator.validateAndHandle(action, context);
        });
    }

    /**
     * Detaches the game mode from the EventProvider, preventing this mode from listening and
     * responding to user messages. Should be called when switching out of the game mode.
     */
    makeInactive() {
        this.eventProvider.removeCallback(this.eventCallbackId);
    }

    /**
     * Called when a user first joins the mode. Should send the user the appropriate state necessary to synchronize, and inform
     * other players if necessary.
     * @param data - The join mode action
     * @param context - Includes information such as who has just joined the mode and all of the other players
     */
    protected abstract onJoinMode(data: Action<object>, context: GMEventContext): void;
}