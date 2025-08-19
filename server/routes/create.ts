import { Router } from "express";
import { GameManager } from "../game_managers/gm_types";
import { NewGameInfo } from "../shared_types";

export function getCreateRouter(gm: GameManager): Router {
    const createRouter = Router();

    createRouter.get('/', async (req, res) => {
        const gameInfo: NewGameInfo = await gm.generateNewGame();
        res.cookie('user_token', gameInfo.host_token, {maxAge: 30000});
        res.cookie('game_id', gameInfo.game_id, {maxAge: 30000});
        res.status(201).json(gameInfo);
    });

    return createRouter;
}