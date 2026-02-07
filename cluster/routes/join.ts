import * as express from "express";
import { expressjwt, Request } from "express-jwt";
import { ProxyService } from "../proxy";

function makeJoinRouter(proxyService: ProxyService): express.Router {
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (jwtSecret === undefined) {
        throw new Error("JWT_SECRET environment var not set!");
    }

    const PROXY_HOSTNAME = process.env.PROXY_HOSTNAME;
    if (PROXY_HOSTNAME === undefined) {
        throw new Error("PROXY_HOSTNAME environment var not set!");
    }

    const PROXY_PORT = process.env.PROXY_PORT;

    if (PROXY_PORT === undefined) {
        throw new Error("PROXY_PORT environment var not set!");
    }
    
    const joinRouter = express.Router();
    joinRouter.get("/:game_id",
        expressjwt({
            secret: jwtSecret,
            algorithms: ["HS256"]
        }),
        (req: Request, res) => {
            if (req.auth === undefined) {
                console.warn("req.auth is undefined!");
                res.sendStatus(400);
                return;
            }

            if (req.auth.canJoin !== true) {
                console.warn("User attempted to join cluster without valid privilege!");
                res.sendStatus(403);
                return;
            }

            if(req.params.game_id === undefined) {
                console.warn("/join missing game id");
                res.sendStatus(400);
                return;
            }

            if (typeof req.params.game_id !== "string") {
                console.warn(`/join game_id not a string: ${req.params.game_id}`);
                res.sendStatus(400);
                return;
            }

            let gameId;
            try {
                gameId = Number.parseInt(req.params.game_id, 10);
            }
            catch {
                console.warn("/join game_id not a number");
                res.sendStatus(400);
                return;
            }

            if(!proxyService.isForwarding(gameId)) {
                console.warn(`/join attempt to join game id "${gameId}", but not known to proxy`);
                res.sendStatus(404);
                return;
            }

            res.status(200).json({
                gameId: gameId,
                wsUrl: `ws://${PROXY_HOSTNAME}:${PROXY_PORT}/?gameid=${gameId}`
            });
        }
    );

    return joinRouter;
}


export default makeJoinRouter;