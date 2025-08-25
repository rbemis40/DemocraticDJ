import { Router } from "express";
import { GameManager } from "../game_managers/gm_types";
import { NewGameInfo } from "../shared_types";

export function getJoinRouter(gm: GameManager): Router {
    const joinRouter = Router();

    // joinRouter.get('/:game_id', async (req, res) => {
    //     if (!req.params.game_id) {
    //         res.status(400).json({error: `game_id must be provided`});
    //     }

    //     console.log(req.params.game_id);

    //     let gameIdInt;
    //     try {
    //         gameIdInt = Number.parseInt(req.params.game_id);
    //     }
    //     catch (err) {
    //         res.status(400).json({error: `game_id must be a number`});
    //     }

    //     const game = await gm.getGame(gameIdInt);
    //     const newUserToken = game.addNewUser();

    //     res.cookie('user_token', newUserToken);
    //     res.cookie('game_id', gameIdInt);
    //     res.status(200).json({game_id: gameIdInt, user_token: newUserToken});
    // });

    return joinRouter;
}