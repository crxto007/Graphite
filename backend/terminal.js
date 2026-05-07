const { spawn: cpSpawn } = require('child_process');
const os = require('os');

/**
 * Terminal manager that handles shell spawning and WebSocket communication
 */
function setupTerminal(ws) {
  console.log('--- Starting Terminal Session ---');

  const shell = process.env.SHELL || (process.platform === 'darwin' ? '/bin/zsh' : process.platform === 'win32' ? 'powershell.exe' : '/bin/bash');
  console.log(`Using shell: ${shell}`);

  try {
    // We are bypassing node-pty and using standard child_process.spawn
    // This avoids the "posix_spawnp failed" error entirely.
    const ptyProcess = cpSpawn(shell, [], {
      cwd: process.cwd(),
      env: { ...process.env, TERM: 'xterm-256color' },
      shell: true
    });

    console.log('Successfully spawned shell via child_process');

    // Pipe output to WebSocket
    ptyProcess.stdout.on('data', (data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
      }
    });

    ptyProcess.stderr.on('data', (data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
      }
    });

    // Handle input from WebSocket
    ws.on('message', (message) => {
      try {
        const messageStr = message.toString();
        const parsed = JSON.parse(messageStr);

        if (parsed.type === 'input') {
          ptyProcess.stdin.write(parsed.data);
        }
      } catch (e) {
        // If not JSON, write raw string
        ptyProcess.stdin.write(message.toString());
      }
    });

    ws.on('close', () => {
      console.log('Terminal client closed, killing shell');
      ptyProcess.kill();
    });

    ptyProcess.on('exit', (code) => {
      console.log(`Shell exited with code ${code}`);
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'output', data: `\r\n[Process exited with code ${code}]\r\n` }));
        ws.close();
      }
    });

  } catch (error) {
    console.error('Critical terminal spawn error:', error);
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'output', data: `Critical Error spawning shell: ${error.message}\r\n` }));
    }
  }
}

module.exports = { setupTerminal };
