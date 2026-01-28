import { Router } from "express";
import { GameServer } from "../../shared/shared_types";

export function getJoinRouter(): Router {
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

        let gameServer: GameServer;
        try {
            gameServer = await gm.getServerByGameId(gameIdInt);
        }
        catch (err) {
            res.status(400).json({error: `Unknown game id ${gameIdInt}`});
            return;
        }
        
        const newUserToken = TokenHandler.generateToken({
            isHost: false,
            username: name,
        });
        const serverURLStr = (await gameServer.getServerURL()).toString();

        res.status(200).json({game_id: gameIdInt, user_token: newUserToken, server_url: serverURLStr});
    });

    return joinRouter;
}