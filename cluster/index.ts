import * as express from "express";
import * as http from "http";
import { WSReverseProxy } from "./proxy";
import { WebSocket } from "ws";
import { DockerService } from "./container/docker_service";
import makeCreateRouter from "./routes/create";
import { ContainerService } from "./container/container_service";
import { GameIdGenerator } from "./gameid_generator";
import makeJoinRouter from "./routes/join";

const app = express();
const server = http.createServer(app);

const containerService: ContainerService = new DockerService();
const proxyService = new WSReverseProxy();
proxyService.listen(8082);

const gameIdGenerator = new GameIdGenerator(100000, 999999);

app.use("/create", makeCreateRouter(
    containerService,
    proxyService,
    gameIdGenerator
));

app.use("/join", makeJoinRouter(
    proxyService
))

const port = 8081;
server.listen(port, () => {
    console.log(`Running cluster on port ${port}`);
});

// const proxy = new WSReverseProxy();
// proxy.forward(123456, new URL("ws://127.0.0.1:8081"));
// proxy.listen(8080);

// const host = new WebSocket("ws://127.0.0.1:8080/?gameid=123456");
// const player = new WebSocket("ws://127.0.0.1:8080/?gameid=123456");

// host.on("message", (data) => {
//     console.log("Host: ");
//     console.log(data.toString());
// });

// player.on("message", (data) => {
//     console.log("Player: ");
//     console.log(data.toString());
// }) ;

// setTimeout(() => {
//     host.send(JSON.stringify({
//         action: "player_join",
//         data: {
//             isHost: true
//         }
//     }));

//     player.send(JSON.stringify({
//         action: "player_join",
//         data: {
//             username: "hello",
//             isHost: false
//         }
//     }));

//     player.send(JSON.stringify({
//         action: "joined_mode",
//         data: {}
//     }));
// }, 1000);
