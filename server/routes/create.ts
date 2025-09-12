import { Router } from "express";
import { GameManager } from "../game_managers/gm_types";
import { GameId, NewGameInfo, UserToken } from "../shared_types";
import { GameServer } from "../game_servers/server_types";

export function getCreateRouter(gm: GameManager): Router {
    const createRouter = Router();

    createRouter.get('/', async (req, res) => {
        // Get the Spotify API code to request an access token
        if (req.query.code === undefined || typeof req.query.code !== 'string') {
            res.status(400).json({
                error: 'Expected "code" query paramater in /create request'
            });

            return;
        }

        const gameId: GameId = await gm.generateNewGame(req.query.code);
        const gameServer: GameServer = await gm.getServerByGameId(gameId);
        const hostToken: UserToken = await gameServer.generateHostToken(gameId);
        const serverURL: URL = await gameServer.getServerURL();

        const gameInfo: NewGameInfo = {
            host_token: hostToken,
            game_id: gameId,
            server_url: serverURL.toString(),
        };

        res.status(201).json(gameInfo);
    });

    return createRouter;
}