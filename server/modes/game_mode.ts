import Ajv, { JSONSchemaType } from "ajv";
import { User } from "../game_server/user";
import { Action } from "../game_server/action";
import { PlayerList } from "../game_server/player_list";
import { Validator, ValidatorPair } from "../handlers/validator";

export type PlayerData = {
    sender: User,
    all: PlayerList
}

/**
 * Provides the basic interface for each game mode including the mode's name for server / client messages,
 * as well as the framework for requesting action handlers
 * @param T - The action data types that the game mode accepts
 */
export abstract class GameMode {
    protected name: string;
    protected validator: Validator<GameMode, PlayerData>;

    constructor(name: string) {
        this.name = name;
        this.validator = new Validator();
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
    handleAction(action: Action<object>, sender: User, allPlayers: PlayerList): GameMode {
        const nextMode = this.validator.validateAndHandle(action, {
            sender: sender,
            all: allPlayers
        });
        if (nextMode !== null) {
            return nextMode;
        }
        
        return this;
    }  

    /**
     * Called when a user first joins this mode, this returns an action to initialize client state
     * @param newPlayer - The player who has just joined the mode
     * @param allPlayers - The player list of current players
     * @returns Action that a user will use to synchronize their state
     */
    abstract getNewJoinAction(newPlayer: User, allPlayers: PlayerList): Action<object>;    
}