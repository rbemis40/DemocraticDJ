import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
const ajv = new Ajv();

type Action = {
    name: string,
    data: object
};

const actionSchema: JSONSchemaType<Action> = {
    type: 'object',
    properties: {
        name: {type: 'string'},
        data: {type: 'object'}
    },
    required: ['name', 'data'],
    additionalProperties: false
};

type Msg = {
    server_mode: string, // The game mode the client is currently on. If it does not match the current mode, then don't continue processing and return an error
    action: Action
};

const msgSchema: JSONSchemaType<Msg> = {
    type: 'object',
    properties: {
        server_mode: {type: 'string'},
        action: actionSchema
    },
    required: ['server_mode', 'action']
};

const validateMsg = ajv.compile(msgSchema);

type ActionHandlers = {
    [serverMode: string]: {
        [actionName: string]: {
            validator: ValidateFunction
            handlers: Handler[] // Returns true if it was able to handle the action, otherwise false and a generic error should be sent
        }
    }
};

type Handler = (msg: Msg) => boolean;

/**
 * Provides an interface to process incoming client messages, validate their structure, and pass to appropriate handlers
 * @static
 */
export class MessageHandler {
    private static serverMode: string = '';
    private static actionHandlers: ActionHandlers = {};

    /**
     * Create a new mode/action pair that handlers can be registered on. Each action that matches these
     * must also have a valid action data according to the provided schema
     * @param mode - The server mode that handlers expect
     * @param actionName - The action name that handlers expect
     * @param schema - The schema that will be used to validate action data before calling handlers
     */
    static defineAction(mode: string, actionName: string, schema: JSONSchemaType<unknown>) {
        this.actionHandlers[mode][actionName] = {
            validator: ajv.compile(schema),
            handlers: []
        };
    }

    /**
     * Register a new handler for the given server mode and action
     * @param mode - The mode the server must be in for the handler to be called
     * @param actionName - The action to trigger on
     * @param handler - The handler to be run when all of the conditions are met
     */
    static on(mode: string, actionName: string, handler: Handler) {
        if (!(mode in this.actionHandlers)) {
            throw new Error(`Invalid attempt to add message handler to unknown game mode: ${mode}`);
        }

        if (!(actionName in this.actionHandlers[mode])) {
            throw new Error(`Invalid attempt to add message handler to unknown action: ${actionName}`);
        }

        this.actionHandlers[mode][actionName].handlers.push(handler);
    }
    
    /**
     * Parse a message, ensure the client's expected server mode matches the actual server mode, and if it has the correct
     * structure, pass it to each of the registered handlers for that server mode/action
     * @param msgStr 
     * @throws (SyntaxError) If msgStr is not a valid message object, or if the action data schema is invalid for the given action
     * @throws (Error) If the msg contains the incorrect server mode
     */
    static handle(msgStr: string) {
        const msgObj = JSON.parse(msgStr);
        if (!validateMsg(msgObj)) {
            throw new SyntaxError('Parsed msgStr is not a valid msg');
        }

        if(msgObj.server_mode !== this.serverMode) {
            throw new Error('Msg contains incorrect server mode');
        }

        // Find the correct action handlers for this kind of message
        if (!(msgObj.server_mode in this.actionHandlers) || !(msgObj.action.name in this.actionHandlers[msgObj.server_mode])) {
            console.log(`No handlers exist for mode '${msgObj.server_mode}' and action '${msgObj.action.name}'`);
            return; // There are no handlers for this message
        }

        const actionHandlerInfo = this.actionHandlers[msgObj.server_mode][msgObj.action.name];

        // Make sure the action data is valid according to the specified action schema
        if (!actionHandlerInfo.validator(msgObj.action.data)) {
            throw new SyntaxError(`Invalid action data for mode '${msgObj.server_mode}' and action ${msgObj.action}`);
        }

        // If it is all valid, pass it to the appropriate handlers
        actionHandlerInfo.handlers.forEach(handler => handler(msgObj));
    }

    /**
     * Update the current server mode
     * @param newMode - The updated server mode
     */
    static setServerMode(newMode: string) {
        this.serverMode = newMode;
    }
}