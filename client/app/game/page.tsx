interface GameProps {
    gameId: number;
    userToken: string;
}

export default function GamePage(props: GameProps) {
    return (
        <h1>{`You are in game ${props.gameId} as user ${props.userToken}`}</h1>
    )
}