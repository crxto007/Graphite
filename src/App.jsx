import React, { useState, useEffect, useRef, Suspense } from 'react';
import FileExplorer from './components/FileExplorer';
import TerminalPanel from './panels/TerminalPanel';
import GraphPanel from './panels/GraphPanel';
import CodePanel from './panels/CodePanel';
import { useGraphStore } from './store/graphStore';

// Debounce function to limit the rate at which a function can fire
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

function App() {
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(300); // Use pixels for consistency
  const [bottomHeight, setBottomHeight] = useState(200); // Use pixels for consistency
  const wsRef = useRef(null);

  // Get state and setters from Zustand store
  const setNodes = useGraphStore(state => state.setNodes);
  const setEdges = useGraphStore(state => state.setEdges);
  const updateFile = useGraphStore(state => state.updateFile);
  const setSelectedFilePath = useGraphStore(state => state.setSelectedFilePath);
  const upsertNode = useGraphStore(state => state.upsertNode);
  const upsertEdge = useGraphStore(state => state.upsertEdge);
  const removeNode = useGraphStore(state => state.removeNode);

  // Set up WebSocket connection for graph updates
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Graph WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === 'graph_update') {
            // Handle node and edge updates
            if (data.nodes && data.nodes.length > 0) {
              data.nodes.forEach(node => {
                upsertNode(node);
              });
            }

            if (data.edges && data.edges.length > 0) {
              data.edges.forEach(edge => {
                upsertEdge(edge);
              });
            }

            // Handle node deletions
            if (data.deletedNodeId) {
              removeNode(data.deletedNodeId);
            }
          }
          // Handle initial full graph load (optional)
          else if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        console.log('Graph WebSocket disconnected');
        // Attempt to reconnect after a short delay
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    // Connect on component mount
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [setNodes, setEdges, updateFile, setSelectedFilePath, upsertNode, upsertEdge, removeNode]);

    const startResizing = (direction) => {
    const startX = window.event.clientX;
    const startY = window.event.clientY;
    const startLeftWidth = leftWidth;
    const startRightWidth = rightWidth;
    const startBottomHeight = bottomHeight;

    // Debounced resize handler to improve performance
    const debouncedOnMouseMove = debounce((e) => {
      if (direction === 'left') {
        // Pulling right expands the explorer
        setLeftWidth(startLeftWidth + (e.clientX - startX));
      } else if (direction === 'right') {
        // Pulling left expands the code editor (decreases center area)
        const deltaWidth = startX - e.clientX;
        setRightWidth(Math.max(200, startRightWidth + deltaWidth));
      } else if (direction === 'bottom') {
        // Pulling up expands the terminal (decreases center area)
        const deltaHeight = startY - e.clientY;
        setBottomHeight(Math.max(100, startBottomHeight + deltaHeight));
      }
    }, 16); // ~60fps

    const onMouseMove = (e) => {
      debouncedOnMouseMove(e);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      // Clear any pending debounced calls
      debouncedOnMouseMove.cancel && debouncedOnMouseMove.cancel();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="app-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="text-primary font-weight-medium">Visual IDE</div>
        <div className="text-muted">
          <span>Local Workspace</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="main-content">
        {/* Left Sidebar: File Explorer */}
        <div className="panel" style={{ width: `${leftWidth}px` }}>
          <div className="panel-header">Explorer</div>
          <div className="panel-body">
            <FileExplorer />
          </div>
        </div>

        {/* Resize Handle Left */}
        <div
          className="resize-handle"
          onMouseDown={(e) => startResizing('left')}
          onMouseEnter={(e) => e.currentTarget.classList.add('active')}
          onMouseLeave={(e) => e.currentTarget.classList.remove('active')}
        />

        {/* Center and Right Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Center: Graph Canvas */}
            <div className="panel" style={{ flex: 1 }}>
              <div className="panel-header">Graph Canvas</div>
              <div className="panel-body">
                <GraphPanel />
              </div>
            </div>

            {/* Resize Handle Right */}
            <div
              className="resize-handle"
              onMouseDown={(e) => startResizing('right')}
              onMouseEnter={(e) => e.currentTarget.classList.add('active')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('active')}
            />

            {/* Right: Code Editor */}
            <div className="panel" style={{ width: `${rightWidth}px` }}>
              <div className="panel-header">Code Viewer</div>
              <div className="panel-body">
                <CodePanel />
              </div>
            </div>
          </div>

          {/* Resize Handle Bottom */}
          <div
            className="resize-handle-horizontal"
            onMouseDown={(e) => startResizing('bottom')}
            onMouseEnter={(e) => e.currentTarget.classList.add('active')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('active')}
          />

          {/* Bottom: Terminal */}
          <div className="panel" style={{ height: `${bottomHeight}px` }}>
            <div className="panel-header">Terminal</div>
            <div className="panel-body">
              <TerminalPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;