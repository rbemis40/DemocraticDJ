import express  from 'express';
import cors from 'cors';
import { getCreateRouter } from './routes/create';
import { getJoinRouter } from './routes/join';
import http from 'http';

import { JWTTokenManager, TokenManager } from '../shared/tokens/token_manager';
import { Cluster } from './game_managers/cluster_types';
import { SimpleCluster } from './game_managers/cluster';
import { loadVars } from "../shared/utils/envvars";

const app = express();
const server = http.createServer(app)

const [CLIENT_URL, JWT_SECRET, CLUSTER_URL] = loadVars(["CLIENT_URL", "JWT_SECRET", "CLUSTER_URL"]);

app.use(cors({origin: CLIENT_URL, credentials: true}));

const tm: TokenManager = new JWTTokenManager(JWT_SECRET, "HS256");

const cluster: Cluster = new SimpleCluster(CLUSTER_URL, tm);

// Add routes
app.use('/create', getCreateRouter(cluster));
app.use('/join', getJoinRouter(cluster));

const port = 8080;
server.listen(port, () => {
    console.log(`Running game management server on port ${port}`);
});
