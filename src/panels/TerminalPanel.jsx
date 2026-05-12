import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useGraphStore } from '../store/graphStore';
import { useWebSocketStore } from '../store/webSocketStore';

export default function TerminalPanel() {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const wsRef = useRef(null);

  // Get state and setters from Zustand store
  const upsertNode = useGraphStore(state => state.upsertNode);
  const upsertEdge = useGraphStore(state => state.upsertEdge);
  const removeNode = useGraphStore(state => state.removeNode);

  useEffect(() => {
    if (!terminalRef.current) return;

    // 1. Initialize xterm.js with explicit defaults to prevent the 'dimensions' error
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'JetBrains Mono, monospace',
      theme: {
        background: '#FFFFFF',
        foreground: '#202124'
      },
      cols: 80,
      rows: 24,
      disableStdin: false
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Open terminal and fit it
    term.open(terminalRef.current);

    // Use requestAnimationFrame to ensure the DOM has painted and dimensions are available
    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.error('FitAddon failed:', e);
      }
    });

    xtermRef.current = term;

    // 2. Robust WebSocket connection with exponential backoff
    let retryCount = 0;
    const connect = () => {
      const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Terminal WebSocket connected');
        retryCount = 0;
        ws.send(JSON.stringify({ type: 'ready' }));
        useWebSocketStore.getState().setWebSocket(ws); // Store the WebSocket instance
        startPing();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle terminal output only
          if (data.type === 'output') {
            term.write(data.data);
          } else {
            // If it's not a recognized type, just write it to the terminal
            // This could be any other unexpected message from the backend
            term.write(event.data);
          }
        } catch (e) {
          // If not JSON, write raw string
          term.write(event.data);
        }
      };

      ws.onclose = () => {
        console.log(`Terminal WebSocket disconnected. Retry #${++retryCount}...`);
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(connect, delay);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };

      return ws;
    };

    let pingInterval;
    const startPing = () => {
      pingInterval = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 20000); // Send ping every 20 seconds
    };

    const stopPing = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };

    const ws = connect();

    // 3. Input handler
    term.onData((data) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'input', data }));
        } catch (e) {
          console.error('Error sending terminal data:', e);
          wsRef.current.send(data);
        }
      }
    });

    // 4. Resize handler
    const handleResize = () => {
      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'resize',
              cols: term.options.cols,
              rows: term.options.rows
            }));
          }
        } catch (e) {
          console.error('FitAddon failed on resize:', e);
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) wsRef.current.close();
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: 'block'
      }}
    />
  );
}
