import * as express from "express";
import * as http from "http";
import createRouter from "./routes/create";
import { WSReverseProxy } from "./proxy";
import { WebSocket } from "ws";
import { DockerService } from "./container/docker_service";

const app = express();
const server = http.createServer(app);

app.use("/create", createRouter);

const port = 8082;
server.listen(port, () => {
    console.log(`Running cluster on port ${port}`);
});

const dockerServ = new DockerService()
dockerServ.startContainer(123456, "democraticdj-gameserver:latest")
    .then(port => {
        console.log("STARTED ON PORT: " + port);
    })
    .catch(err => {
        console.error(err);
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
