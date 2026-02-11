import { MusicService } from "./music_service.js";
import { SpotifyService } from "./spotify/spotify_service.js";
export class MusicServiceFactory {
    constructor() {}

    async buildMusicService(name: string): Promise<MusicService> {
        switch(name) {
            case "spotify": {
                const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
                if (redirectUri === undefined) {
                    throw new Error(`Environment var SPOTIFY_REDIRECT_URI not set!`);
                }

                const spotify = new SpotifyService();
                await spotify.connect(redirectUri);
                return spotify;
            }
            default: {
                throw new Error(`MusicServiceFactory.buildMusicService: Unknown music service "${name}"`);
            }
        }
    }
}