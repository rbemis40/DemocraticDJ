import { ReactNode } from "react";
import styles from "./styles.module.css";

interface GlassBoxProps {
    children: ReactNode;
}

export default function GlassBox(props: GlassBoxProps) {
    return (
        <div className={styles.glassDiv}>
            {props.children}
        </div>
    );
}