import * as express from "express";
import { expressjwt, Request } from "express-jwt";
import { GameId, PlayerTokenData } from "../../shared/shared_types";
import { JWTTokenManager, TokenManager } from "../../shared/tokens/token_manager";
import { ContainerService } from "../container/container_service";
import { ProxyService } from "../proxy/proxy";
import { GameIdGenerator } from "../gameid_generator";
import { ClusterCreateResponse } from "../../shared/responses";

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

            if (req.query.code === undefined || typeof req.query.code !== "string") {
                console.warn("User attempted to create game without spotify code query param");
                res.sendStatus(400);
                return;
            }

            const gameId: GameId = gameIdGenerator.genNewId();

            const tokenSecret = "HELLOWORLD"; // TODO: Generate a unique token secret for the new game server
            const tokenManager: TokenManager = new JWTTokenManager("HELLOWORLD", "HS256");
                       
            const port = await containerService.startContainer(gameId, req.query.code, "democraticdj-gameserver:latest"); // Starts a containerized game server with the game id in it's environment, returns the port number the server is running on
            if(!proxyService.forward(gameId, new URL(`ws://127.0.0.1:${port}`))) { // Requests sent to the game with gameId will be forwarded to the server running on the corresponding url (the container)
                throw new Error(`Failed to forward on proxy using game id "${gameId}"`);
            }

            // Generate a token that verifies that this user is the host when joining the game server
            const token = tokenManager.generateToken<PlayerTokenData>({
                isHost: true
            });


            res.status(201).json({
                gameId: gameId,
                serverUrl: `${proxyService.getUrl()}/?gameid=${gameId}`,
                hostToken: token
            } satisfies ClusterCreateResponse);
        }
    );

    return createRouter;
}

export default makeCreateRouter; 