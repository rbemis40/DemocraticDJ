import styles from "./VoterBarChart.module.css";

interface VoterBarChartProps {
    playerInfo: {
        name: string;
        voteCount: number;
    }[],
    height: string;
}

export default function VoterBarChart(props: VoterBarChartProps) {
    const totalVotes = props.playerInfo.reduce((curSum, info) => curSum + info.voteCount, 0);

    return (
        <div className={styles.container} style={{ height: props.height }}>
            {props.playerInfo.map(info =>
                <div className={styles.playerContainer} key={info.name}>
                    <div className={styles.bar} style={{ height: `${info.voteCount / totalVotes * 100}%` }}></div>
                    <p className={`text-spaced ${styles.name}`}>{info.name}</p>
                </div>
            )}
        </div>
    );
}