const { spawn } = require('node-pty');
const os = require('os');

function setupTerminal(ws) {
  // Determine shell based on OS
  const shell = process.platform === 'win32' ? 'cmd.exe' : process.platform === 'darwin' ? 'zsh' : 'bash';

  // Create pty
  const pty = spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });

  // Handle pty output
  pty.on('data', (data) => {
    // Send data to client
    ws.send(JSON.stringify({ type: 'output', data }));
  });

  // Handle messages from client
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'input') {
      pty.write(message.data);
    } else if (message.type === 'resize') {
      pty.resize(message.cols, message.rows);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    pty.kill();
  });

  // Handle pty exit
  pty.on('exit', () => {
    ws.close();
  });

  return pty;
}

module.exports = { setupTerminal };