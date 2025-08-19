import * as express  from 'express';
import * as cors from 'cors';
import { getCreateRouter } from './routes/create';
import { SimpleGameManager } from './game_managers/simple_gm';
import { GameManager } from './game_managers/gm_types';

const app = express();
app.use(cors());

const port = 80;

const gm: GameManager = new SimpleGameManager();

// Add routes
app.use('/create', getCreateRouter(gm));

app.listen(port, () => {
    console.log(`Running game management server on port ${port}`)  
});