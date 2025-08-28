import { useEffect } from "react";
import { SendFn } from "../types";

export default function useSendJoinedMode(mode: string, sendMsg: SendFn) {
    const modeChangedMsg = {
        type: 'joined_mode',
        mode: mode
    };

    useEffect(() => {
        sendMsg(JSON.stringify(modeChangedMsg));
    }, [sendMsg]);
}