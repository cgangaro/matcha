const express = require('express');
const http = require('http');
const fs = require('fs');
const migrationRunner = require('./config/database/migrationRunner');
const cors = require('cors');
const socketIo = require('socket.io');

const userRouter = require('./router/userRouter');
const tagsRouter = require('./router/tagsRouter');
const blocksRouter = require('./router/blocksRouter');
const likesRouter = require('./router/likesRouter');
const reportsRouter = require('./router/reportsRouter');
const viewsRouter = require('./router/viewsRouter');
const messagesRouter = require('./router/messagesRouter');

require('dotenv').config();
require('./config/checkEnv');

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const port = process.env.NODE_PORT;

var corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200
};

// Run migrations if migrations.lock file doesn't exist yet
if (!fs.existsSync('./config/database/migrations.lock')) {
    migrationRunner.runMigrations();
}

app.use(cors(corsOptions));
app.use(express.json());

app.use("/users", userRouter);
app.use("/tags", tagsRouter);
app.use("/blocks", blocksRouter);
app.use("/likes", likesRouter);
app.use("/reports", reportsRouter);
app.use("/views", viewsRouter);
app.use("/messages", messagesRouter);


app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

const io = socketIo(server, { cors: corsOptions });
require('./sockets/socketsController')(io);

server.listen(port, () => {
    console.log(`Server is running on port ${port}, http://localhost:${port}`);
});