import { JSONSchemaType, SchemaObject } from "ajv";
import { User } from "../game_server/user";
import { Action } from "../game_server/action";
import { PlayerList } from "../game_server/player_list";

export type GameModeAction<T extends object> = {
    name: string,
    schema: JSONSchemaType<T>
};

export abstract class GameMode {
    protected name: string;
    protected 
    constructor(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    /**
     * Returns all of the actions that this game mode can handle
     * @returns The list of actions
     */
    abstract getActions(): GameModeAction<object>[];

    /**
     * Handles the given action and returns the game mode that the game should transition to (or itself)
     * @param action - The action to be handled
     * @param sendingPlayer - The player who performed / sent the action
     * @param allPlayers - The current players in the game
     * @returns The new game mode the game should transition to, or the same game mode otherwise
     */
    abstract handleAction(action: Action<object>, sendingPlayer: User, allPlayers: PlayerList): GameMode;

    /**
     * Called when a user first joins this mode, this returns an action to initialize client state
     * @param newPlayer - The player who has just joined the mode
     * @param allPlayers - The player list of current players
     * @returns Action that a user will use to synchronize their state
     */
    abstract getNewJoinAction(newPlayer: User, allPlayers: PlayerList): Action<object>;
}