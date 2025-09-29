'use client';
import { createContext, ReactNode, useRef } from "react";
import { ServerMsg } from "../_types/server_msg";

export type ServerMsgHandler = (msgData: ServerMsg) => void;

export type ServerMsgSubscribeFn = (actionName: string, callback: ServerMsgHandler) => void; 
export type ServerMsgTriggerFn = (actionName: string, msgData: ServerMsg) => void;

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
    /* Need to store a map from (action name) -> (list of msg handlers for this event) */
    const actionNameToHandler = useRef(new Map<string, ServerMsgHandler[]>());

    function subscribe(actionName: string, callback: ServerMsgHandler) {
        // Add this callback to the map
        const handlerArr = actionNameToHandler.current.get(actionName) || [];
        handlerArr.push(callback);
        actionNameToHandler.current.set(actionName, handlerArr);
    }

    function unsubscribe(actionName: string, callback: ServerMsgHandler) {
        if (!actionNameToHandler.current.has(actionName)) {
            return;
        }

        const newHandlerArr = actionNameToHandler.current.get(actionName)!.filter((curCallback) => curCallback !== callback);
        actionNameToHandler.current.set(actionName, newHandlerArr);
    }

    function trigger(actionName: string, msgData: ServerMsg) {
        actionNameToHandler.current.get(actionName)?.forEach(callback => callback(msgData));
    }

    return (
        <ServerMsgContext value={[trigger, subscribe, unsubscribe]}>
            {props.children}
        </ServerMsgContext>
    );
}