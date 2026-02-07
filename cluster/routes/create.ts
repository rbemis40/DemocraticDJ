import * as express from "express";
import { expressjwt, Request } from "express-jwt";
import { GameId } from "../../shared/shared_types";
import { ContainerService } from "../container/container_service";
import { ProxyService } from "../proxy";
import { GameIdGenerator } from "../gameid_generator";

const JOIN_HOSTNAME = process.env.JOIN_HOSTNAME;
if (JOIN_HOSTNAME === undefined) {
    throw new Error("Environment var JOIN_HOSTNAME not set!");
}

function makeCreateRouter(containerService: ContainerService, proxyService: ProxyService, gameIdGenerator: GameIdGenerator): express.Router {
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (jwtSecret === undefined) {
        throw new Error("JWT_SECRET environment var not set");
    }

    const createRouter: express.Router = express.Router();
    createRouter.get("/",
        expressjwt({
            secret: jwtSecret,
            algorithms: ["HS256"]
        }),
        async (req: Request, res) => {
            if (req.auth === undefined) {
                console.warn("req.auth is undefined!");
                res.sendStatus(400);
                return;
            }
            
            if (req.auth.canCreate !== true) {
                console.warn("User attempted to create game with invalid privilege");
                res.sendStatus(403);
                return;
            }

            const gameId: GameId = gameIdGenerator.genNewId();
            const port = await containerService.startContainer(gameId, "democraticdj-gameserver:latest"); // Starts a containerized game server with the game id in it's environment, returns the port number the server is running on
            if(!proxyService.forward(gameId, new URL(`ws://127.0.0.1:${port}`))) { // Requests sent to the game with gameId will be forwarded to the server running on the corresponding url (the container)
                throw new Error(`Failed to forward on proxy using game id "${gameId}"`);
            }

            const joinUrl = `http://${JOIN_HOSTNAME}/join/${gameId}`;

            res.status(201).json({
                gameId: gameId,
                joinUrl: joinUrl
            });
        }
    );

    return createRouter;
}

export default makeCreateRouter; 