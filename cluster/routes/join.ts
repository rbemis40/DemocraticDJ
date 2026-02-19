import * as express from "express";
import { expressjwt, Request } from "express-jwt";
import { ProxyService } from "../proxy/proxy";
import { ClusterJoinResponse } from "../../shared/responses";
import { JWTTokenManager } from "../../shared/tokens/token_manager";
import { PlayerTokenData } from "../../shared/shared_types";
import { SecretStore } from "../secret_store";

function makeJoinRouter(proxyService: ProxyService, secretStore: SecretStore): express.Router {
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (jwtSecret === undefined) {
        throw new Error("JWT_SECRET environment var not set!");
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


            if (!req.query.name) {
                console.warn("/join name must be provided in query string")
                res.status(400).json({error: `name must be provided in query string`});
                return;
            }

            if (typeof req.query.name !== 'string') {
                console.warn("/join name must be string");
                res.status(400).json({error: `name must be a string`});
                return;
            }
            const name: string = req.query.name as string;

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

            const tokenSecret = secretStore.getSecret(gameId);
            if (tokenSecret === undefined) {
                console.warn(`/join: secretStore did not contain secret for game id "${gameId}"`);
                res.sendStatus(500);
                return;
            }

            const playerToken = new JWTTokenManager(tokenSecret, "HS256").generateToken<PlayerTokenData>({
                username: name,
                isHost: false
            });

            res.status(200).json({
                gameId: gameId,
                serverUrl: `${proxyService.getUrl()}/?gameid=${gameId}`,
                playerToken: playerToken
            } satisfies ClusterJoinResponse );
        }
    );

    return joinRouter;
}


export default makeJoinRouter;