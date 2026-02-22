import { MouseEventHandler } from "react";
import styles from "./styles.module.css";

interface UIButtonProps {
    children: string;   
    id?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function UIButton(props: UIButtonProps) {
    return (
        <button id={props.id} className={styles.buttonStyle} onClick={props.onClick}>{props.children}</button>
    );
}