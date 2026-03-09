"use client";

import { useEffect, useState } from "react";
import { AiFillExclamationCircle } from "react-icons/ai";
import styles from "./ErrorBanner.module.css";

interface ErrorBannerProps {
    text: string;
    autoCloseInterval?: number;
}

export default function ErrorBanner(props: ErrorBannerProps) {
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        if (props.autoCloseInterval === undefined) {
            return () => {};
        }

        const timeoutId = setTimeout(() => {
            setIsClosed(true);
        }, props.autoCloseInterval * 1000);

        return () => {clearTimeout(timeoutId);}
    }, [props.autoCloseInterval]);

    return (
        <div className={`${styles.bannerContainer} ${isClosed ? styles.closed : ""}`}>
            <AiFillExclamationCircle size={"1.2em"}/>
            <p>{props.text}</p>
        </div>
    );
}