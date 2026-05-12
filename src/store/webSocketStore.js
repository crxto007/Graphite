import { create } from 'zustand';

export const useWebSocketStore = create((set) => ({
  websocket: null,
  setWebSocket: (ws) => set({ websocket: ws }),
  sendMessage: (message) => {
    const { websocket } = useWebSocketStore.getState();
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  },
}));
