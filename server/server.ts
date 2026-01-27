import * as express  from 'express';
import * as cors from 'cors';
import { getCreateRouter } from './routes/create';
import { SimpleGameManager } from './game_managers/simple_gm';
import { GameManager } from './game_managers/gm_types';
import { getJoinRouter } from './routes/join';
import * as http from 'http';

import { GameServer } from '../shared/shared_types';

const app = express();
const server = http.createServer(app)
//const wsServer = new WebSocketServer({server: server});

app.use(cors({origin: 'http://localhost:3000', credentials: true}));
const gm: GameManager = new SimpleGameManager();

// Add routes
app.use('/create', getCreateRouter(gm));
app.use('/join', getJoinRouter(gm));

const port = 8080;
server.listen(port, () => {
    console.log(`Running game management server on port ${port}`);
});
