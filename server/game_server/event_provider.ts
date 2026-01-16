import { Action } from "./action";

/**
 * An internal source of events for the gameserver, such as disconnecting a user
 */
export class EventProvider {
    private callbacks: ((action: Action<object>) => void)[];

    constructor() {
        this.callbacks = [];
    }

    dispatchAction(action: Action<object>) {
        this.callbacks.forEach(callback => {
            callback(action);
        });
    }

    onAction(callback: (action: Action<object>) => void) {
        this.callbacks.push(callback);
    }
}