import styles from "./NeonDivider.module.css";

interface NeonDividerProps {
  width?: string;
}

export default function NeonDivider({ width = "min(420px, 80vw)" }: NeonDividerProps) {
  return <div className={styles.divider} style={{ width }} />;
}
