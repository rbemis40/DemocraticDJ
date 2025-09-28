import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import { User } from '../game_server/user';
import { Game } from '../game_server/game';
const ajv = new Ajv();

type Action<T extends object> = {
    name: string,
    data: T
};

const actionSchema: JSONSchemaType<Action<object>> = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        data: {type: 'object'}
    },
    required: ['name', 'data'],
    additionalProperties: false
};

export type Msg<T extends object> = {
    game_mode: string, // The mode the game must be in for this action
    action: Action<T>
};

const msgSchema: JSONSchemaType<Msg<object>> = {
    type: 'object',
    properties: {
        game_mode: {type: 'string'},
        action: actionSchema
    },
    required: ['game_mode', 'action']
};

const validateMsg = ajv.compile(msgSchema);

type HandlerInfo<T extends Object> = {
    validator: ValidateFunction
    handlers: Handler<T>[] // Returns true if it was able to handle the action, otherwise false and a generic error should be sent
}

type ActionHandlers<T extends object> = {
    [server_mode: string]: {
        [actionName: string]: HandlerInfo<T>
    }
};

type Handler<T extends object> = (msg: Msg<T>, user: User, game: Game) => void;

/**
 * Provides an interface to process incoming client messages, validate their structure, and pass to appropriate handlers
 * @static
 */
export class MessageHandler {
    private actionHandlers: ActionHandlers<object> = {
        any: {} // A default target that can be used to catch any message regardless of game mode
    };
    private game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    /**
     * Create a new mode/action pair that handlers can be registered on. Each action that matches these
     * must also have a valid action data according to the provided schema
     * @param mode - The server mode that handlers expect
     * @param actionName - The action name that handlers expect
     * @param schema - The schema that will be used to validate action data before calling handlers
     */
    defineAction<T>(mode: string, actionName: string, schema: JSONSchemaType<T>) {
        this.actionHandlers[mode][actionName] = {
            validator: ajv.compile(schema),
            handlers: []
        };
    }

    /**
     * Register a new handler for the given server mode and action
     * @param mode - The server mode that should handle the action
     * @param actionName - The action to trigger on
     * @param handler - The handler to be run when all of the conditions are met
     */
    on<T extends object>(mode: string, actionName: string, handler: Handler<T>) {
        if (!(mode in this.actionHandlers)) {
            throw new Error(`Invalid attempt to add message handler to unknown server mode': ${mode}`);
        }

        if (!(actionName in this.actionHandlers[mode])) {
            throw new Error(`Invalid attempt to add message handler to unknown action: ${actionName}`);
        }

        this.actionHandlers[mode][actionName].handlers.push(handler);
    }
    
    /**
     * Parse a message and if it has the correct structure and the current game mode is correct,
     * pass it to each of the registered handlers for that server mode/action
     * @param msgStr The message text sent by the client
     * @param user The associated user who sent the message
     * @throws (SyntaxError) If msgStr is not a valid message object, or if the action data schema is invalid for the given action
     * @throws (Error) If the msg game mode does not match the current mode
     */
    handle(msgStr: string, user: User) {
        const msgObj = JSON.parse(msgStr);
        if (!validateMsg(msgObj)) {
            throw new SyntaxError('Parsed msgStr is not a valid msg');
        }

        // Ensure the client is synchronized with the current game mode before passing it to handlers
        if(msgObj.game_mode !== this.game.mode) {
            throw new Error(`Client msg contained game mode ${msgObj.game_mode}, but game is in mode ${this.game.mode}`);
        }

        // Find any handlers that can handle this message
        // This is either handlers that exactly match mode/action name,
        // but also handlers that are part of any/action name

        const handlerGroups: HandlerInfo<object>[] = [];
        
        // Check 'any' first
        if (msgObj.action.name in this.actionHandlers['any']) {
            handlerGroups.push(this.actionHandlers['any'][msgObj.action.name]);
        }

        // Check if there are handlers for that specific mode
        if (msgObj.game_mode in this.actionHandlers && msgObj.action.name in this.actionHandlers[msgObj.game_mode]) {
            handlerGroups.push(this.actionHandlers[msgObj.game_mode][msgObj.action.name]);
        }

        // If there are no handlers, log that because it means the client sent an unknown message, and return
        if (handlerGroups.length === 0) {
            console.log(`No handlers registered to handle clinet msg ${msgStr}`);
            return;
        }

        // Now validate and run the handlers for each group of handlers
        handlerGroups.forEach(actionHandlerInfo => {
            // Make sure the action data is valid according to the specified action schema
            if (!actionHandlerInfo.validator(msgObj.action.data)) {
                throw new SyntaxError(`Invalid action data for mode '${msgObj.game_mode}' and action ${msgObj.action}`);
            }

            // If it is all valid, pass it to the appropriate handlers
            actionHandlerInfo.handlers.forEach(handler => handler(msgObj, user, this.game));
        });
    }
}

// A convenience type and schema for simple messages with no data
export type NoData = {};
export const noDataSchema: JSONSchemaType<NoData> = {
    type: 'object'
};