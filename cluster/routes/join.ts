import * as express from "express";
import { expressjwt, Request } from "express-jwt";

const jwtSecret: string | undefined = process.env.JWT_SECRET;
if (jwtSecret === undefined) {
    throw new Error("JWT_SECRET environment var not set");
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

        
    }
);

export default joinRouter;