import { Router } from "express";
import { ClusterGameInfo, GameId, NewGameInfo as ClientGameInfo, UserToken } from "../../shared/shared_types";
import { Cluster } from "../game_managers/cluster_types";

export function getCreateRouter(cluster: Cluster): Router {
    const createRouter = Router();

    createRouter.get('/', async (req, res) => {
        // Get the Spotify API code to request an access token
        if (req.query.code === undefined || typeof req.query.code !== 'string') {
            res.status(400).json({
                error: 'Expected "code" query paramater in /create request'
            });

            return;
        }

        const clusterInfo: ClusterGameInfo = await cluster.createGame(req.query.code);
        const gameServerInfo = await cluster.joinGame(clusterInfo.gameId, {
            role: "host"            
        });

        const gameInfo: ClientGameInfo = {
            host_token: gameServerInfo.token,
            game_id: clusterInfo.gameId,
            server_url: gameServerInfo.wsUrl,
        };

        res.status(201).json(gameInfo);
    });

    return createRouter;
}