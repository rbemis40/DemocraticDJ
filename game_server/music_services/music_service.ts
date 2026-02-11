interface TrackImg {
    url: string;
    width: number;
    height: number;
};

export interface TrackInfo {
    name: string;
    id: string;
    artists: string[];
    image: TrackImg;
    track_uri: string;
};

export interface MusicService {
    search(title: string): Promise<TrackInfo[]>;
    getTrackInfoById(id: string): Promise<TrackInfo>;
}