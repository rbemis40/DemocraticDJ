import { Router } from "express";
import { Cluster } from "../game_managers/cluster_types";
import { ClusterJoinResponse } from "../../shared/responses";

export function getJoinRouter(cluster: Cluster): Router {
    const joinRouter = Router();

    joinRouter.get('/:game_id', async (req, res) => {
        if (!req.params.game_id) {
            console.warn(`/join no valid game_id`);
            res.status(400).json({error: `game_id must be provided`});
            return;
        }

        if (!req.query.name) {
            console.warn(`/join no valid name`);
            res.status(400).json({error: `name must be provided in query string`});
            return;
        }

        if (typeof req.query.name !== 'string') {
            console.warn("/join name must be a string");
            res.status(400).json({error: `name must be a string`});
            return;
        }
        const name: string = req.query.name as string;

        let gameIdInt;
        try {
            gameIdInt = Number.parseInt(req.params.game_id, 10);
        }
        catch (err) {
            console.warn("/join game_id not a number");
            res.status(400).json({error: `game_id must be a number`});
            return;
        }
        
        const gameInfo: ClusterJoinResponse = await cluster.joinGame(gameIdInt, {
            username: name
        });

        res.status(200).json({
            game_id: gameInfo.gameId, 
            user_token: gameInfo.playerToken, 
            server_url: gameInfo.serverUrl
        });
    });

    return joinRouter;
}