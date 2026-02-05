import * as express from "express";
import { expressjwt, Request } from "express-jwt";
import { GameId } from "../../shared/shared_types";

function makeCreateRouter() {
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
        (req: Request, res) => {
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

            //const gameId: GameId = generateUniqueId();
            // const port = await containerService.startContainer(gameId); // Starts a containerized game server with the game id in it's environment, returns the port number the server is running on
            // proxyService.forward(gameId, port); // Requests sent to the game with gameId will be forwarded to the server running on the corresponding port (the container)

            // res.status(201).json({
            //     gameId: gameId,
            //     joinUrl: joinUrl
            // });
        }
    );
}

export default makeCreateRouter; 