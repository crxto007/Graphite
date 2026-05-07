import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      }
    }),
    {
      name: 'ide-graph-state'
    }
  )
);
