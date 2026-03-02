"use client";

import { CSSProperties, useEffect, useState } from "react";
import styles from "./AmbientCircle.module.css";

interface AmbientCircleProps {
    size: number;
    color: string;
    xSpeed: number;
    ySpeed: number;
    startX: number;
    startY: number;
    right?: boolean;
    bottom?: boolean;
}

interface PosObj {
    top?: string;
    bottom?: string;
    right?: string;
    left?: string;
}

export default function AmbientCircle(props: AmbientCircleProps) {
    const [x, setX] = useState<number>(props.startX);
    const [y, setY] = useState<number>(props.startY);
    const [animated, setAnimated] = useState<boolean>(false);

    useEffect(() => {
        let frameId: number;

        let lastTime = performance.now();

        const minX = 0;
        const minY = 0;
        const maxX = window.innerWidth;
        const maxY = window.innerHeight;
        const epsilon = 0;

        let curXSpeed = props.xSpeed;
        let curYSpeed = props.ySpeed;

        let centerX: number;
        let centerY: number;

        if (props.right) {
            centerX = window.innerWidth - x - (props.size / 2);
        }
        else {
            centerX = x + (props.size / 2);
        }

        if (props.bottom) {
            centerY = window.innerHeight - y - (props.size / 2);
        }
        else {
            centerY = y + (props.size / 2);
        }

        const animate = (curTime: DOMHighResTimeStamp) => {
            const elapsedTime = curTime - lastTime;
            lastTime = curTime;

            const xDelta = curXSpeed * elapsedTime;
            const yDelta = curYSpeed * elapsedTime;

            centerX += xDelta;
            if (centerX < minX - epsilon) {
                centerX = minX;
                curXSpeed = -curXSpeed;
            }
            if (centerX > maxX + epsilon) {
                centerX = maxX;
                curXSpeed = -curXSpeed;
            }

            centerY += yDelta;
            if (centerY < minY - epsilon) {
                centerY = minY;
                curYSpeed = -curYSpeed;
            }
            if (centerY > (maxY + epsilon)) {
                centerY = maxY;
                curYSpeed = -curYSpeed;
            }

            setX(centerX - (props.size / 2));
            setY(centerY - (props.size / 2));
            setAnimated(true);
            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, []);

    const dynamicStyle: CSSProperties = {
        width: props.size,
        height: props.size,
        background: `radial-gradient(circle, ${props.color} 0%, transparent 70%)`,
    };

    // Setup the initial position (before animating) depending on if position is relative to top / bottom and left / right
    const startPosObj: PosObj = {}
    props.right ? startPosObj.right = `${props.startX}px` : startPosObj.left = `${props.startX}px`;
    props.bottom ? startPosObj.bottom = `${props.startY}px` : startPosObj.top = `${props.startY}px`;

    return (
        <div
            className={styles.circle}
            style={animated ? {...dynamicStyle, top: `${y}px`, left: `${x}px`} : {...dynamicStyle, ...startPosObj}}
        />
    );
}
