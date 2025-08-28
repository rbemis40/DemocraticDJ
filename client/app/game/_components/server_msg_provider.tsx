'use client';
import { createContext, ReactNode, useRef } from "react";

export type ServerMsgHandler = (msgData: any) => void;

export type ServerMsgSubscribeFn = (type: string, callback: ServerMsgHandler) => void; 
export type ServerMsgTriggerFn = (type: string, msgData: any) => void;

export type ServerMsgContextFns = [
    (ServerMsgTriggerFn),
    (ServerMsgSubscribeFn),
    (ServerMsgSubscribeFn)
];

function unimplementedFn() {
    throw new Error(`Can't use ServerMsgContext outside of a ServerMsgProvider!`);
}

export const ServerMsgContext = createContext<ServerMsgContextFns>([unimplementedFn, unimplementedFn, unimplementedFn]);

interface ServerMsgProviderProps {
    children: ReactNode;
}

export default function ServerMsgProvider(props: ServerMsgProviderProps) {
    /* Need to store a map from (event type) -> (list of msg handlers for this event) */
    const typeToHandler = useRef(new Map<string, ServerMsgHandler[]>());

    function subscribe(type: string, callback: ServerMsgHandler) {
        // Add this callback to the map
        const handlerArr = typeToHandler.current.get(type) || [];
        handlerArr.push(callback);
        typeToHandler.current.set(type, handlerArr);
    }

    function unsubscribe(type: string, callback: ServerMsgHandler) {
        if (!typeToHandler.current.has(type)) {
            return;
        }

        const newHandlerArr = typeToHandler.current.get(type)!.filter((curCallback) => curCallback !== callback);
        typeToHandler.current.set(type, newHandlerArr);
    }

    function trigger(type: string, msgData: any) {
        typeToHandler.current.get(type)?.forEach(callback => callback(msgData));
    }

    return (
        <ServerMsgContext value={[trigger, subscribe, unsubscribe]}>
            {props.children}
        </ServerMsgContext>
    );
}