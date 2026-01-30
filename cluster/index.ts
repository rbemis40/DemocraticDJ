import * as express from "express";
import * as http from "http";
import createRouter from "./routes/create";
import { WSReverseProxy } from "./proxy";

const app = express();
const server = http.createServer(app);

app.use("/create", createRouter);

const port = 8082;
server.listen(port, () => {
    console.log(`Running cluster on port ${port}`);
});

const proxy = new WSReverseProxy();
proxy.listen(8080);

const test = new WebSocket("ws://127.0.0.1:8080/hello");
