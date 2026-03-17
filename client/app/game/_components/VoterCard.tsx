import { ReactNode } from "react";
import styles from "./VoterCard.module.css";

interface VoterCardProps {
    username: string;
    delay?: number;
    duration?: number;
    children?: ReactNode;
}

export default function VoterCard(props: VoterCardProps) {
    return (
        <div className={styles.container}>
            {props.children && 
            <div className={styles.songCardContainer} style={{ animationDelay: `${props.delay ?? 0}ms` }}>
                {props.children}
            </div>
            }
            <p className={`neon-text-magenta ${styles.name}`} style={{ animationDelay: `${props.delay ?? 0}ms`, animationDuration: `${props.duration ?? 500}ms` }}>{props.username}</p>
        </div>
    );
}