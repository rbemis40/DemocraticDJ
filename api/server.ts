import * as express  from 'express';
import * as cors from 'cors';
import { getCreateRouter } from './routes/create';
import { getJoinRouter } from './routes/join';
import * as http from 'http';
import * as jwt from "jsonwebtoken";

import { PrivilegeToken } from '../shared/tokens/token_types';
import { JWTTokenManager, TokenManager } from '../shared/tokens/token_manager';
import { Cluster } from './game_managers/cluster_types';
import { SimpleCluster } from './game_managers/cluster';

const app = express();
const server = http.createServer(app)

app.use(cors({origin: 'http://localhost:3000', credentials: true}));

const jwtSecret: string | undefined = process.env.JWT_SECRET;
if (jwtSecret === undefined) {
    throw new Error("JWT_SECRET environment var not set!");
}

const tm: TokenManager<PrivilegeToken> = new JWTTokenManager<PrivilegeToken>(jwtSecret, "HS256");

const clusterHostname = process.env.CLUSTER_HOSTNAME;
if (clusterHostname === undefined) {
    throw new Error("CLUSTER_HOSTNAME environment var not set!");
}

const cluster: Cluster = new SimpleCluster(clusterHostname, tm);

// Add routes
app.use('/create', getCreateRouter(cluster));
app.use('/join', getJoinRouter(cluster));

const port = 8080;
server.listen(port, () => {
    console.log(`Running game management server on port ${port}`);
});
