import * as express  from 'express';
import * as cors from 'cors';
import { getCreateRouter } from './routes/create';
import { getGameRouter } from './routes/game';
import { SimpleGameManager } from './game_managers/simple_gm';
import { GameManager } from './game_managers/gm_types';
import { getJoinRouter } from './routes/join';
import * as http from 'http';

import { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app)
const wsServer = new WebSocketServer({server: server});

app.use(cors());

const gm: GameManager = new SimpleGameManager();

// Add routes
app.use('/create', getCreateRouter(gm));
app.use('/join', getJoinRouter(gm));
app.use('/game', getGameRouter());

// TODO: This is a temporary solution. 
// Instead, each game server should actually have it's own server, 
// and the client could ask the web server how to connect
wsServer.on('connection', (ws, req) => {
    ws.on('message', (msg) => {
        console.log(`Received message: ${msg}`);
        ws.send('Message received');
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const port = 80;
server.listen(port, () => {
    console.log(`Running game management server on port ${port}`);
});