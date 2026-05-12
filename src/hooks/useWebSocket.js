import { useEffect, useState } from 'react';

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useState(() => null)[0];

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      // This hook doesn't handle messages directly
      // Consumers should subscribe to messages separately
      // or pass in a callback function
      if (ws.onMessageCallback) {
        try {
          const data = JSON.parse(event.data);
          ws.onMessageCallback(data);
        } catch (e) {
          ws.onMessageCallback(event.data);
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, [url]);

  // Method to send a message
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  // Method to set a handler function
  const setMessageHandler = (handler) => {
    if (wsRef.current) {
      wsRef.current.onMessageHandler = handler;
    }
  };

  return { isConnected, sendMessage, setMessageHandler, wsRef };
};