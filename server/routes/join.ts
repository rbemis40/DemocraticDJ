import { Router } from "express";
import { GameManager } from "../game_managers/gm_types";

export function getJoinRouter(gm: GameManager): Router {
    const joinRouter = Router();

    joinRouter.get('/:game_id', async (req, res) => {
        if (!req.params.game_id) {
            res.status(400).json({error: `game_id must be provided`});
        }

        let gameIdInt;
        try {
            gameIdInt = Number.parseInt(req.params.game_id);
        }
        catch (err) {
            res.status(400).json({error: `game_id must be a number`});
            return;
        }

        let gameServer;
        try {
            gameServer = await gm.getServerByGameId(gameIdInt);
        }
        catch (err) {
            res.status(400).json({error: `Unknown game id ${gameIdInt}`});
            return;
        }
        
        const newUserToken = await gameServer.generateUserToken(gameIdInt);
        const serverURLStr = (await gameServer.getServerURL()).toString();


        res.cookie('user_token', newUserToken);
        res.cookie('game_id', gameIdInt);
        res.cookie('server_url', serverURLStr);
        res.status(200).json({game_id: gameIdInt, user_token: newUserToken, server_url: serverURLStr});
    });

    return joinRouter;
}