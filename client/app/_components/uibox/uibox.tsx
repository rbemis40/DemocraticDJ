import { ReactNode } from "react";
import styles from "./styles.module.css";

interface UIBoxProps {
    children: ReactNode;
}

export default function UIBox(props: UIBoxProps) {
    return (
        <div className={styles.container}>
            {props.children}
        </div>
    );
}