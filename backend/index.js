const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');
const { registerFileRoutes } = require('./files');
const { setupTerminal } = require('./terminal');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Broadcast function to send messages to all connected clients
function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Register routes
registerFileRoutes(app);
wss.on('connection', (ws) => {
  setupTerminal(ws);

  // Handle incoming messages from clients if needed
  ws.on('message', (message) => {
    console.log('Received message from client:', message);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, wss, broadcastMessage };