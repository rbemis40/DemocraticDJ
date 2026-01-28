import * as express from "express";
import * as http from "http";
import createRouter from "./routes/create";

const app = express();
const server = http.createServer(app);

app.use("/create", createRouter);

const port = 8082;
server.listen(port, () => {
    console.log(`Running cluster on port ${port}`);
});
