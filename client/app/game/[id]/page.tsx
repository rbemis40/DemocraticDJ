interface JoinedGameParams {
    id: number
}

// This page will be the page that displays the actual content for the game (host vs player)
export default async function JoinedGamed({ params }: {params: Promise<JoinedGameParams>}) {
    const { id } = await params;

    return (
        <h1>You have joined game {id}</h1>
    );
}