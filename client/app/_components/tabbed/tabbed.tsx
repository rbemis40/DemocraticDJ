"use client";

import { ReactNode, useState } from "react"
import styles from "./styles.module.css"

type Tab = [string, ReactNode];

interface TabbedProps {
    tabs: Tab[]
}

export default function Tabbed(props: TabbedProps) {
    const [curTab, setCurTab] = useState<number>(0);

    return (
        <div className={styles.container}>
            <div className={styles.tabNames}>
                {props.tabs.map((tab, index) => {
                    let style = "";
                    if (index == curTab) {
                        style += ' ' + styles.selectedTabButton;
                    }

                    return <button className={`${styles.tabButton} ${style}`} key={tab[0]} onClick={() => setCurTab(index)}>{tab[0]}</button>
                })}
            </div>
            <div className={styles.tabContent}>
                {props.tabs[curTab][1]}
            </div>
        </div>
    )
}