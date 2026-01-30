import { ClusterGameInfo, GameId, UserInfo } from '../../shared/shared_types';
import { JWTTokenManager, TokenManager } from '../../shared/tokens/token_manager';
import { PrivilegeToken } from '../../shared/tokens/token_types';
import { Cluster } from './cluster_types';

/**
 * The bridge between the create / join API and each cluster. Locates an appropriate cluster to perform the action,
 * and returns the GameId, hostname for the cluster, and token information for the user to use when connecting
 */
export class SimpleCluster implements Cluster {
    private hostname: string;
    private tm: TokenManager<PrivilegeToken>;

    constructor(hostname: string, tokenManager: TokenManager<PrivilegeToken>) {
        this.hostname = hostname;
        this.tm = tokenManager;
    }

    async createGame(spotifyCode: string): Promise<ClusterGameInfo> {
        console.log(this.hostname);
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
    async joinGame(gameId: GameId, userInfo: UserInfo): Promise<{token: string, wsUrl: string}> {
        let params;
        if(userInfo.role === "host") {
            params = new URLSearchParams([
                ["role", "host"]
            ]);
        }
        else if (userInfo.role === "player") {
            params = new URLSearchParams([
                ["role", "player"],
                ["username", userInfo.username!]
            ]);
        }

        const url = new URL(`/join/${gameId}?${params?.toString()}`, this.hostname);

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

        return await res.json();
    }
}