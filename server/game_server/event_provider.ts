import { Action } from "./action";

/**
 * An internal source of events for the gameserver, such as disconnecting a user
 */
export class EventProvider<ContextType> {
    private callbacks: ((action: Action<object>, context: ContextType) => void)[];

    constructor() {
        this.callbacks = [];
    }

    dispatchAction(action: Action<object>, context: ContextType) {
        this.callbacks.forEach(callback => {
            callback(action, context);
        });
    }

    onAction(callback: (action: Action<object>, context: ContextType) => void) {
        this.callbacks.push(callback);
    }
}