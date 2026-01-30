import { Router } from "express";
import { Cluster } from "../game_managers/cluster_types";

export function getJoinRouter(cluster: Cluster): Router {
    const joinRouter = Router();

    joinRouter.get('/:game_id', async (req, res) => {
        if (!req.params.game_id) {
            res.status(400).json({error: `game_id must be provided`});
        }

        if (!req.query.name) {
            res.status(400).json({error: `name must be provided in query string`});
        }

        if (typeof req.query.name !== 'string') {
            res.status(400).json({error: `name must be a string`});
        }
        const name: string = req.query.name as string;

        let gameIdInt;
        try {
            gameIdInt = Number.parseInt(req.params.game_id);
        }
        catch (err) {
            res.status(400).json({error: `game_id must be a number`});
            return;
        }
        
        const gameServerInfo = await cluster.joinGame(gameIdInt, {
            role: "player",
            username: name
        });

        res.status(200).json({
            game_id: gameIdInt, 
            user_token: gameServerInfo.token, 
            server_url: gameServerInfo.wsUrl
        });
    });

    return joinRouter;
}