import { useEffect, useState } from "react"

interface CountdownProps {
    initTime: number;
}

export default function Countdown(props: CountdownProps) {
    const [timeRem, setTimeRem] = useState<number>(props.initTime);

    useEffect(() => {
        let timeoutId: any;

        const repeat = (timeLeft: number) => {
            if (timeLeft <= 0) {
                setTimeRem(0);
                return;
            }
            else {
                setTimeRem(timeLeft);
            }

            const waitAtLeast = (duration: number, done: () => void) => {
                if (duration <= 0) {
                    done();
                    return;
                }
                
                const startTime = Date.now();
                timeoutId = setTimeout(() => {
                    const elapsedTime = Date.now() - startTime;
                    waitAtLeast(duration - elapsedTime, done);
                }, duration);
            }

            const startTime = Date.now();
            let waitTime = timeLeft % 1000;
            if (waitTime === 0) {
                waitTime = 1000;
            }
            waitAtLeast(waitTime, () => {
                const elapsedTime = Date.now() - startTime;
                repeat(timeLeft - elapsedTime);
            });
        }

        repeat(props.initTime);

        return () => clearTimeout(timeoutId);
    }, [props.initTime]);

    return (
        <h1>Time Remaining: {Math.round(timeRem / 1000)}</h1>
    )
}