import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWebSocketStore } from './webSocketStore'; // Import the WebSocket store

const saveGraph = async (state) => {
  try {
    const response = await fetch('/api/graph/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        files: state.files
      })
    });
    if (!response.ok) throw new Error('Save failed');
  } catch (e) {
    console.error('Auto-save failed:', e);
  }
};

export const useGraphStore = create(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      files: {},
      selectedFilePath: null,
      // Execution state
      isExecuting: false,
      executionQueue: [],
      currentExecutingNodeId: null,
      executionResults: {},

      setNodes: (nodes) => {
        set({ nodes });
        saveGraph(get());
      },
      setEdges: (edges) => {
        set({ edges });
        saveGraph(get());
      },
      updateFile: (path, content) => {
        set((state) => ({
          files: { ...state.files, [path]: content }
        }));
        saveGraph(get());
      },
      setSelectedFilePath: (path) => {
        set({ selectedFilePath: path });
        saveGraph(get());
      },
      loadGraph: async () => {
        try {
          const response = await fetch('/api/graph/load');
          const data = await response.json();
          set({
            nodes: data.nodes || [],
            edges: data.edges || [],
            files: data.files || {},
            selectedFilePath: data.selectedFilePath || null
          });
        } catch (e) {
          console.error('Load graph failed:', e);
        }
      },
      // New methods for real-time updates
      upsertNode: (node) => {
        set((state) => {
          // Check if node already exists
          const existingIndex = state.nodes.findIndex(n => n.id === node.id);
          const newNodes = [...state.nodes];

          if (existingIndex >= 0) {
            // Update existing node (but don't change position if user moved it)
            // Only update label, type, exports - keep existing position data
            const existingNode = state.nodes[existingIndex];
            newNodes[existingIndex] = {
              ...existingNode,
              label: node.label,
              type: node.type,
              exports: node.exports,
              filePath: node.filePath
              // Note: We deliberately do NOT update x, y position here
              // to preserve user's manual positioning
            };
          } else {
            // Add new node
            newNodes.push(node);
          }

          return { nodes: newNodes };
        });
        saveGraph(get());
      },
      upsertEdge: (edge) => {
        set((state) => {
          // Check if edge already exists
          const existingIndex = state.edges.findIndex(
            e => e.from === edge.from && e.to === edge.to && e.label === edge.label
          );
          const newEdges = [...state.edges];

          if (existingIndex >= 0) {
            // Update existing edge
            newEdges[existingIndex] = edge;
          } else {
            // Add new edge
            newEdges.push(edge);
          }

          return { edges: newEdges };
        });
        saveGraph(get());
      },
      removeNode: (nodeId) => {
        set((state) => {
          // Remove the node
          const newNodes = state.nodes.filter(node => node.id !== nodeId);
          // Remove all edges connected to this node
          const newEdges = state.edges.filter(
            edge => edge.from !== nodeId && edge.to !== nodeId
          );

          return { nodes: newNodes, edges: newEdges };
        });
        saveGraph(get());
      },

      // Execution control
      startExecution: () => {
        set({ isExecuting: true, executionResults: {} });
      },
      pauseExecution: () => {
        set({ isExecuting: false });
      },
      stopExecution: () => {
        set({ isExecuting: false, executionQueue: [], currentExecutingNodeId: null, executionResults: {} });
      },
      setExecutionQueue: (queue) => {
        set({ executionQueue: queue, currentExecutingNodeId: queue[0]?.id ?? null });
      },
      setCurrentExecutingNodeId: (nodeId) => {
        set({ currentExecutingNodeId: nodeId });
      },
      setExecutionResult: (nodeId, result) => {
        set((state) => ({
          executionResults: {
            ...state.executionResults,
            [nodeId]: result
          }
        }));
      },
      clearExecution: () => {
        set({ isExecuting: false, executionQueue: [], currentExecutingNodeId: null, executionResults: {} });
      },

      // Action to run a terminal command via WebSocket
      runTerminalCommand: (command) => {
        useWebSocketStore.getState().sendMessage({
          type: 'workflow-command',
          data: command + '\r' // Add newline for execution
        });
      },
    }),
    {
      name: 'ide-graph-state'
    }
  )
);
