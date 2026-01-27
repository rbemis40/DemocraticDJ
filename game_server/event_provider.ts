import { Action } from "./action";

type EventCallback<ContextType> = (action: Action<object>, context: ContextType) => void;

/**
 * An internal source of events for the gameserver, such as disconnecting a user
 */
export class EventProvider<ContextType> {
    private idToCallback: Map<number, EventCallback<ContextType>>;
    private nextId: number;
    
    constructor() {
        this.idToCallback = new Map();
        this.nextId = 0;
    }

    dispatchAction(action: Action<object>, context: ContextType) {
        this.idToCallback.forEach((callback) => {
            callback(action, context);
        })
    }

    onAction(callback: (action: Action<object>, context: ContextType) => void): number {
        const id = this.nextId;
        this.nextId++;

        this.idToCallback.set(id, callback);
        return id;
    }

    removeCallback(id: number): boolean {
        return this.idToCallback.delete(id);
    }
}