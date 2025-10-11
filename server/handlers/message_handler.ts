import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import { User } from '../game_server/user';
import { Action, actionSchema } from '../game_server/action';
const ajv = new Ajv();

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

const validateMsg = ajv.compile(msgSchema); // Used to validate Msgs

type HandlerInfo<T extends Object> = {
    validator: ValidateFunction
    handlers: Handler<T>[] // Returns true if it was able to handle the action, otherwise false and a generic error should be sent
}

type ActionHandlers<T extends object> = {
    [actionName: string]: HandlerInfo<T>
};

type Handler<T extends object> = (msg: Msg<T>, user: User) => void;

/**
 * Provides an interface to process incoming client messages, validate their structure, and pass to appropriate handlers
 * @static
 */
export class MessageHandler {
    private actionHandlers: ActionHandlers<object>;

    constructor() {
        this.actionHandlers = {}
    }

    /**
     * Define a new action and schema
     * @param actionName - The action name that handlers expect
     * @param schema - The schema that will be used to validate action data before calling handlers
     */
    defineAction<T>(actionName: string, schema: JSONSchemaType<T>) {
        this.actionHandlers[actionName] = {
            validator: ajv.compile(schema),
            handlers: []
        };
    }

    /**
     * Deletes an action and the corresponding handlers
     * @param actionName - The name of the action to delete
     * @returns - True if the action existed, false otherwise
     */
    deleteAction(actionName: string): boolean {
        if (this.actionHandlers[actionName] === undefined) {
            return false;
        }

        delete this.actionHandlers[actionName];
        return true;
    }

    /**
     * Register a new handler for the given server mode and action
     * @param mode - The server mode that should handle the action
     * @param actionName - The action to trigger on
     * @param handler - The handler to be run when all of the conditions are met
     */
    on<T extends object>(actionName: string, handler: Handler<T>) {
        if (!(actionName in this.actionHandlers)) {
            throw new Error(`Invalid attempt to add message handler to unknown action: ${actionName}`);
        }

        this.actionHandlers[actionName].handlers.push(handler);
    }
    
    /**
     * Parse a message and if it has the correct structure and the current game mode is correct,
     * pass it to each of the registered handlers for that server mode/action
     * @param msgStr The message text sent by the client
     * @param user The associated user who sent the message
     * @returns True if there was a handler for the action, false if there was no handler
     * @throws (SyntaxError) If msgStr is not a valid message object, or if the action data schema is invalid for the given action
     */
    handle(msgStr: string, user: User): boolean {
        const msgObj = JSON.parse(msgStr);
        if (!validateMsg(msgObj)) {
            throw new SyntaxError(`Parsed msgStr is not a valid msg: ${msgStr}`);
        }

        if (this.actionHandlers[msgObj.action.name] === undefined) {
            throw new SyntaxError(`Invalid action name "${msgObj.action.name}"`);
        }

        const actionHandlerInfo = this.actionHandlers[msgObj.action.name];

        // Make sure the action data is valid according to the specified action schema
        if (!actionHandlerInfo.validator(msgObj.action.data)) {
            throw new SyntaxError(`Invalid action data for mode '${msgObj.game_mode}' and action ${msgObj.action}`);
        }

        if (actionHandlerInfo.handlers.length === 0) {
            return false;
        }

        // If it is valid, pass it to the appropriate handlers
        actionHandlerInfo.handlers.forEach(handler => handler(msgObj, user));
        return true;
    }
}

// A convenience type and schema for simple messages with no data
export type NoData = {};
export const noDataSchema: JSONSchemaType<NoData> = {
    type: 'object'
};