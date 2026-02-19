import express from "express";
import { expressjwt, Request } from "express-jwt";
import { GameId, PlayerTokenData } from "../../shared/shared_types";
import { JWTTokenManager, TokenManager } from "../../shared/tokens/token_manager";
import { ContainerService } from "../container/container_service";
import { ProxyService } from "../proxy/proxy";
import { GameIdGenerator } from "../gameid_generator";
import { ClusterCreateResponse } from "../../shared/responses";
import { SecretStore } from "../secret_store";
import { loadVars } from "../../shared/utils/envvars";

const [ GAME_SERVER_BASE_URL ] = loadVars(["GAME_SERVER_BASE_URL"]);

function makeCreateRouter(containerService: ContainerService, proxyService: ProxyService, gameIdGenerator: GameIdGenerator, secretStore: SecretStore): express.Router {
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

            if (req.query.service === undefined || typeof req.query.service !== "string") {
                console.warn(`User attempted to create game with invalid service param: ${req.query.service}`);
                res.sendStatus(400);
                return;
            }

            const gameId: GameId = gameIdGenerator.genNewId();
            secretStore.generateNewSecret(gameId, 256);

            const tokenSecret = secretStore.getSecret(gameId)!;
            const tokenManager: TokenManager = new JWTTokenManager(tokenSecret, "HS256");
                       
            const containerInfo = await containerService.startContainer("democraticdj-gameserver:latest", {
                GAME_ID: gameId.toString(),
                TOKEN_SECRET: tokenSecret,
                MUSIC_SERVICE: req.query.service
            }); // Starts a containerized game server with the game id in it's environment

            const port = containerInfo.port;
            console.log(`Container info: ${containerInfo.id}`);

            if(!proxyService.forward(gameId, new URL(`${GAME_SERVER_BASE_URL}:${port}`))) { // Requests sent to the game with gameId will be forwarded to the server running on the corresponding url (the container)
                throw new Error(`Failed to forward on proxy using game id "${gameId}"`);
            }

            // Attach a callback to the container exiting, so that the proxy service can stop forwarding and close connections if the container exits
            containerService.onContainerStop(containerInfo.id)
                .then((id) => {
                    console.log(`Container with id "${id}" stopped!`);
                    proxyService.stopForwarding(gameId);
                    gameIdGenerator.freeId(gameId);
                    secretStore.freeSecret(gameId);
                })

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