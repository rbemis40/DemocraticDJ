import express from "express";
import http from "http";
import { WSReverseProxy } from "./proxy/proxy";
import { DockerService } from "./container/docker_service";
import makeCreateRouter from "./routes/create";
import { ContainerService } from "./container/container_service";
import { GameIdGenerator } from "./gameid_generator";
import makeJoinRouter from "./routes/join";
import { SecretStore } from "./secret_store";
import { loadVar, loadVars } from "../shared/utils/envvars";

const app = express();
const server = http.createServer(app);

const containerService: ContainerService = new DockerService();

const [PROXY_PORT, PROXY_URL] = loadVars(["PROXY_PORT", "PROXY_URL"]);

const proxyService = new WSReverseProxy(PROXY_URL, Number.parseInt(PROXY_PORT, 10));
proxyService.listen();

const gameIdGenerator = new GameIdGenerator(100000, 999999);
const secretStore = new SecretStore();

app.use("/create", makeCreateRouter(
    containerService,
    proxyService,
    gameIdGenerator,
    secretStore
));

app.use("/join", makeJoinRouter(
    proxyService,
    secretStore
))

const CLUSTER_SERVER_PORT = loadVar("CLUSTER_SERVER_PORT");

server.listen(CLUSTER_SERVER_PORT, () => {
    console.log(`Running cluster on port ${CLUSTER_SERVER_PORT}`);
});