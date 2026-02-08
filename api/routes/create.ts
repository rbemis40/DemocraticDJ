import { Router } from "express";
import { NewGameInfo as ClientGameInfo } from "../../shared/shared_types";
import { Cluster } from "../game_managers/cluster_types";
import { ClusterCreateResponse } from "../../shared/responses";

export function getCreateRouter(cluster: Cluster): Router {
    const createRouter = Router();

    createRouter.get('/', async (req, res) => {
        // Get the Spotify API code to request an access token
        if (req.query.code === undefined || typeof req.query.code !== 'string') {
            res.status(400).json({
                error: 'Expected "code" query parameter in /create request'
            });

            return;
        }

        const clusterInfo: ClusterCreateResponse = await cluster.createGame(req.query.code);

        const gameInfo: ClientGameInfo = {
            host_token: clusterInfo.hostToken,
            game_id: clusterInfo.gameId,
            server_url: clusterInfo.serverUrl,
        };

        res.status(201).json(gameInfo);
    });

    return createRouter;
}