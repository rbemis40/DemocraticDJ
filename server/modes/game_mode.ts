import { MessageHandler } from "../handlers/message_handler";

export type ActionHandlerPair = {
    action: string;
    handler: 
}

export abstract class GameMode {
    protected name: string;
    protected 
    constructor(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    abstract registerHandlers(msgHandler: MessageHandler): void;
    abstract deregisterHandlers(msgHandler: MessageHandler): void;
}