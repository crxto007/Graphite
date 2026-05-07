const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');
const { registerFileRoutes } = require('./files');
const { registerAI } = require('./ai/router');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Register routes
registerFileRoutes(app);
registerAI(app, wss);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, wss };