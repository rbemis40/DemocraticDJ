import { useContext, useEffect } from "react";
import { ServerMsgContext, ServerMsgHandler } from "../_components/server_msg_provider";

export type MsgTypes = string[];

export default function useServerMsg(handler: ServerMsgHandler, msgTypes: MsgTypes) {
    const [trigger, subscribe, unsubscribe] = useContext(ServerMsgContext);
    /* Subscribe these handlers */
    useEffect(() => {
        msgTypes.forEach(type => subscribe(type, handler));
        return () => msgTypes.forEach(type => unsubscribe(type, handler));
    }, [subscribe, unsubscribe, handler, msgTypes]);
}