import * as express  from 'express';
import * as cors from 'cors';
import { getCreateRouter } from './routes/create';
import { SimpleGameManager } from './game_managers/simple_gm';
import { GameManager } from './game_managers/gm_types';
import { getJoinRouter } from './routes/join';
import * as http from 'http';

import { GameServer } from './game_servers/gs_types';
import { SimpleGameServer } from './game_servers/simple_gs';

const app = express();
const server = http.createServer(app)
//const wsServer = new WebSocketServer({server: server});

app.use(cors({origin: 'http://localhost:3000', credentials: true}));
const gm: GameManager = new SimpleGameManager();

// Add routes
app.use('/create', getCreateRouter(gm));
app.use('/join', getJoinRouter(gm));

// TODO: Add a single game server (for now)
const tempServer: GameServer = new SimpleGameServer();
gm.addGameServer(tempServer);

// TODO: This is a temporary solution. 
// Instead, each game server should actually have it's own server, 
// and the client could ask the web server how to connect


// wsServer.on('connection', (ws, req) => {
//     let gameId;
//     try {
//         let splitUrl = req.url.split('/');
//         if (splitUrl.length !== 3 || splitUrl[0] !== '' || splitUrl[1] !== 'game') {
//             throw new Error('Invalid game URL shape');
//         }

//         gameId = Number.parseInt(splitUrl[2]);
//         console.log(`Client connecting to game id: ${gameId}`);
//         ws.on('message', (msg) => {
//             console.log(`Received message: ${msg}`);
//             ws.send('Message received');
//         });
//         ws.on('close', () => {
//             console.log('Client disconnected');
//         });
//     }
//     catch (e) {
//         console.error(e);
//         ws.send('Invalid game URL');
//         ws.close();
//     }
// });

const port = 80;
server.listen(port, () => {
    console.log(`Running game management server on port ${port}`);
});