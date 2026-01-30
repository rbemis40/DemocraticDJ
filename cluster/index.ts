import * as express from "express";
import * as http from "http";
import createRouter from "./routes/create";
import { WSReverseProxy } from "./proxy";
import { WebSocket } from "ws";

const app = express();
const server = http.createServer(app);

app.use("/create", createRouter);

const port = 8082;
server.listen(port, () => {
    console.log(`Running cluster on port ${port}`);
});

const proxy = new WSReverseProxy();
proxy.forward(123456, new URL("ws://127.0.0.1:8081"));
proxy.listen(8080);

const test = new WebSocket("ws://127.0.0.1:8080/?gameid=123456");

test.on("message", (data) => {
    console.log(data.toString());
});


setTimeout(() => {
    test.send(JSON.stringify({
        action: "player_join",
        data: {
            token: "fake token"
        }
    }));
}, 1000);
