import { ReactNode } from "react";
import styles from "./styles.module.css";

interface GlowBoxProps {
    highlight: string;
    glow: string;
    children: ReactNode
}

export default function GlowBox(props: GlowBoxProps) {
    return ( 
    <div className={styles.box} style={
        {
            outlineStyle: "solid",
            outlineColor: props.highlight,
            boxShadow: `0 0 15px 1px ${props.glow} inset, 0 0 15px 1px ${props.glow}`
        }
    }>
        {props.children}
    </div>
    );
}