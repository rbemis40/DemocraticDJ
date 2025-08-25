'use client';

interface GameInfoProps {
    game_id: number;
    user_token: string;
    server_url: string;
};

export default function GameUI(props: GameInfoProps) {
    return (
        <div>
            <h1>You have joined a game with info: </h1>
            <h2>    Game Id: {props.game_id}</h2>
            <h2>    User Token: {props.user_token}</h2>
            <h2>    Server URL: {props.server_url}</h2>
        </div>
    );
}