export interface SpotifySearchResult {
    name: string;
    artists: string[];
    image: {
        url: string;
        width: number;
        height: number;
    }
    track_uri: string;
}