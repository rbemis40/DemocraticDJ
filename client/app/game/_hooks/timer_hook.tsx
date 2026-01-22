import { useEffect, useState } from "react";

export default function useTimer(callback: (time: number) => void): (startTime: number, endTime: number) => void {    
    return (startTime: number, endTime: number) => {
        let curTime = startTime;
        const intId = setInterval(() => {
            curTime += (startTime > endTime ? -1 : 1);
            if (curTime === endTime) {
                clearInterval(intId);
            }

            callback(curTime);
        }, 1000);

        return () => clearInterval(intId);
    }
}