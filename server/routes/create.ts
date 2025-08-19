import { Router } from "express";
import { GameManager } from "../game_managers/gm_types";
import { NewGameInfo } from "../shared_types";

export function getCreateRouter(gm: GameManager): Router {
    const createRouter = Router();

    createRouter.get('/', async (_, res) => {
        const gameInfo: NewGameInfo = await gm.generateNewGame();
        res.status(201).json(gameInfo);
    });

    return createRouter;
}