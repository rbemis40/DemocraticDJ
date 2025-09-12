type Msg = {
    endpoint: string,
    data: unknown
};
type DataPredicate = (data: unknown) => boolean;
type Handler<T> = (data: T) => void;
type HandlerInfo = {
    dataPredicate: DataPredicate,
    handler: Handler<unknown>;
}

export class MessageHandler {
    private handlerMap: Map<string, HandlerInfo>;
    constructor() {
        this.handlerMap = new Map();
    }

    registerEndpoint<T>(endpoint: string, handler: Handler<T>, dataPredicate: DataPredicate): boolean {
        if (this.handlerMap.get(endpoint) !== undefined) {
            return false; // This endpoint has already been registered
        }

        this.handlerMap.set(endpoint, {
            dataPredicate: dataPredicate,
            handler: handler
        });

        return true;
    }

    handleMsg(msg: Msg) {
        if (this.handlerMap.get(msg.endpoint) === undefined) {
            throw new Error('Invalid endpoint'); // An endpoint has not been defined
        } 

        const handlerInfo = this.handlerMap.get(msg.endpoint);
        if (!handlerInfo.dataPredicate(msg.data)) {
            throw new Error('Invalid msg data'); // The msg data is not the expected form
        }

        handlerInfo.handler(msg.data);
    }
}