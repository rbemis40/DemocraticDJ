import { ClusterGameInfo, GameId, UserInfo } from '../../shared/shared_types';
import { JWTTokenManager, TokenManager } from '../../shared/tokens/token_manager';
import { Cluster } from './cluster_types';

/**
 * The bridge between the create / join API and each cluster. Locates an appropriate cluster to perform the action,
 * and returns the GameId, hostname for the cluster, and token information for the user to use when connecting
 */
export class SimpleCluster implements Cluster {
    private hostname: string;
    private tm: TokenManager<unknown>;

    constructor(hostname: string, tokenManager: TokenManager<unknown>) {
        this.hostname = hostname;
        this.tm = tokenManager;
    }

    async createGame(spotifyCode: string): Promise<ClusterGameInfo> {
        const url = new URL("/create", this.hostname);
        
        // Generate a token signed by this server, otherwise the cluster will not create the game
        const token: string = this.tm.generateToken({
            canCreate: true
        });
        
        const res = await fetch(url, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!res.ok) {
            throw new Error(`Cluster /create failed with status code ${res.status}: ${res.statusText}`);
        }

        const gameInfo: ClusterGameInfo = await res.json();
        return gameInfo;
    }

    /**
     * Returns a token issued by the cluster with the player's username, game id, and web socket url that the client should connect to.
     * @param gameId
     * @param userInfo 
     */
    async joinGame(gameId: GameId, userInfo: UserInfo): Promise<string> {
        const url = new URL("/join", this.hostname);

        // Generate a token signed by this server. This allows this API to implement access control in the future, such as API rate limiting, rather than per-cluster
        const token: string = this.tm.generateToken({
            canJoin: true
        });

        const res = await fetch(url, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!res.ok) {
            throw new Error(`Cluster /join failed with status code ${res.status}: ${res.statusText}`);
        }

        const resJson = await res.json();
        const infoToken: string = resJson.token;
        return infoToken;
    }
}