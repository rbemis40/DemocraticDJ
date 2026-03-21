import { Player, PlayerData } from "../player.js";
import { Connection } from "../connection.js";
import { EventProvider } from "../event_provider.js";
import { Validator } from "../handlers/validator.js";
import { Action, buildActionSchema } from "../action.js";
import { JoinedModeData } from "../game/game_actions.js";
import Ajv from "ajv";

export const ajv = new Ajv.Ajv();

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
    protected validator: Validator<GMEventContext>;

    constructor(name: string) {
        this.name = name;
        this.validator = new Validator();
    }

    getName(): string {
        return this.name;
    }

    /**
     * Called externally when a player sends an action, allowing the game mode to update it's state and other players as necessary
     * @param action 
     * @param player 
     */
    handleAction(action: Action<object>, player: Player) {
        if (action.action === "joined_mode") {
            this.onJoinMode(action, player);
        }
    }

    /**
     * Called when a user first joins the mode. Should send the user the appropriate state necessary to synchronize, and inform
     * other players if necessary.
     * @param data - The join mode action
     * @param context - Includes information such as who has just joined the mode and all of the other players
     */
    protected abstract onJoinMode(data: Action<JoinedModeData>, player: Player): void;
    abstract playerLeft(player: Player): void;
}