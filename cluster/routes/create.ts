import * as express from "express";
import { expressjwt, ExpressJwtRequest, Request } from "express-jwt";

const jwtSecret: string | undefined = process.env.JWT_SECRET;
if (jwtSecret === undefined) {
    throw new Error("JWT_SECRET environment var not set");
}

const createRouter: express.Router = express.Router();
createRouter.post("/",
    (res, req, next) => {
        next();
    } ,
    expressjwt({
        secret: jwtSecret,
        algorithms: ["HS256"]
    }),
    (req: Request, res, next) => {
        if (req.auth === undefined) {
            console.log("req.auth is undefined!");
            res.sendStatus(400);
            return;
        }
        console.log(req.auth.hello);
        res.sendStatus(200);
    }
);

export default createRouter; 