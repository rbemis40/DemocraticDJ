import { useEffect, useState } from "react"

import styles from "./Countdown.module.css";

interface CountdownProps {
    initTime: number;
}

export default function Countdown(props: CountdownProps) {
    const [timeRem, setTimeRem] = useState<number>(props.initTime);    

    useEffect(() => {
        const startTime = performance.now();

        let handle: number;
        function animateBar(time: DOMHighResTimeStamp) {
            const elapsedTime = time - startTime;
            if (elapsedTime > props.initTime) {
                setTimeRem(0);
            }
            else {
                setTimeRem(props.initTime - elapsedTime);
                handle = requestAnimationFrame(animateBar);
            }
        }

        handle = requestAnimationFrame(animateBar);

        return () => cancelAnimationFrame(handle);
    }, [props.initTime]);

    const progress = Math.max(0, Math.min(100, (timeRem / props.initTime) * 100));

    return (
        <div className={styles.container}>
            <div
                className={`${styles.bar} ${styles.leftBar}`}
                style={{ clipPath: `inset(0 0 0 ${100 - progress}%)` }}
            />
            <h1 className={`neon-text-magenta ${styles.time}`}>{Math.round(timeRem / 1000)}</h1>
            <div
                className={`${styles.bar} ${styles.rightBar}`}
                style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
            />
        </div>
    )
}