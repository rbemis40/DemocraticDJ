interface SpotifySearchResult {
    tracks: {
        items: {
            name: string;
            artists: {
                name: string;
            }[];
            album: {
                images: {
                    url: string;
                    width: number;
                    height: number;
                }[];
            };
            uri: string;
        }[]
    }
};

interface TrackImg {
    url: string;
    width: number;
    height: number;
};

export interface TrackInfo {
    name: string;
    artists: string[];
    image: TrackImg;
    track_uri: string;
};

export class SpotifyManager {
    access_token: string | undefined;
    connected: boolean;
    constructor() {
        this.access_token = undefined;
        this.connected = false;
    }

    async connect(code: string, redirect_uri: string) {
        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        });
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            body: data,
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64'),
                'content-type': 'application/x-www-form-urlencoded'
            }
        });

        if (res.status !== 200) {
            throw new Error(`Received status ${res.status} from Spotify API while requesting access token`);
        }

        const resData = await res.json();
        this.access_token = resData.access_token;
        this.connected = true;
    }

    async search(query: string): Promise<TrackInfo[]> {
        if (!this.isReady()) {
            throw new Error('Attempt to search using Spotify API without valid connection');
        }

        const params = new URLSearchParams({
            q: query,
            type: 'track'
        });

        const url = 'https://api.spotify.com/v1/search?' + params.toString();
        const res = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + this.access_token
            }
        });

        if (res.status !== 200) {
            throw new Error('Failed to search using Spotify API');
        }

        const results = await res.json() as SpotifySearchResult;
        return results.tracks.items.map(item => {
            const info: TrackInfo = {
                name: item.name,
                artists: item.artists.map(artist => artist.name),
                image: item.album.images[0],
                track_uri: item.uri
            };
            return info;
        });
    }

    async queue(track_uri: string) {
        if (!this.isReady()) {
            throw new Error('Attempt to add to queue using Spotify API without valid connection');
        }

        const params = new URLSearchParams({
            uri: track_uri
        });

        const url = 'https://api.spotify.com/v1/me/player/queue?' + params.toString();
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.access_token
            }
        })

        if (res.status !== 204) {
            //console.error(await res.json());
            throw new Error('Failed to add to queue with response code: ' + res.status);
        }
    }

    private isReady(): boolean {
        return this.connected && this.access_token !== undefined;
    }
}