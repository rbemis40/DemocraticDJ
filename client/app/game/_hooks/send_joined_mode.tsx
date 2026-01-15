import { useEffect } from "react";
import { SendFn } from "../types";

export default function useSendJoinedMode(mode: string, sendMsg: SendFn) {
    const modeChangedMsg = {
        action: 'joined_mode',
        data: {}
    };

    useEffect(() => {
        sendMsg(JSON.stringify(modeChangedMsg));
    }, [sendMsg]);
}