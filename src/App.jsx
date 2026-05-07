import React, { useState } from 'react';
import FileExplorer from './components/FileExplorer';
import TerminalPanel from './panels/TerminalPanel';
import GraphPanel from './panels/GraphPanel';
import CodePanel from './panels/CodePanel';

function App() {
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(40); // Use numbers for %
  const [bottomHeight, setBottomHeight] = useState(30); // Use numbers for %

  const startResizing = (direction) => {
    const startX = window.event.clientX;
    const startY = window.event.clientY;
    const startLeftWidth = leftWidth;
    const startRightWidth = rightWidth;
    const startBottomHeight = bottomHeight;

    const onMouseMove = (e) => {
      if (direction === 'left') {
        // Pulling right expands the explorer
        setLeftWidth(startLeftWidth + (e.clientX - startX));
      } else if (direction === 'right') {
        // Pulling left expands the code editor (decreases center area)
        const deltaPercent = ((startX - e.clientX) / window.innerWidth) * 100;
        setRightWidth(startRightWidth + deltaPercent);
      } else if (direction === 'bottom') {
        // Pulling up expands the terminal (decreases center area)
        const deltaPercent = ((startY - e.clientY) / window.innerHeight) * 100;
        setBottomHeight(startBottomHeight + deltaPercent);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="app-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Visual IDE v1.0.0</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Local Workspace</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="main-content" style={{ height: 'calc(100vh - 28px)' }}>
        {/* Left Sidebar: File Explorer */}
        <div className="panel" style={{ width: `${leftWidth}px`, borderRight: '1px solid var(--border)' }}>
          <div className="panel-header">Explorer</div>
          <div className="panel-body">
            <FileExplorer />
          </div>
        </div>

        {/* Resize Handle Left */}
        <div
          style={{ width: '4px', cursor: 'col-resize', backgroundColor: 'transparent', transition: 'background 0.2s', zIndex: 10 }}
          onMouseDown={(e) => startResizing('left')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        />

        {/* Center and Right Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Center: Graph Canvas */}
            <div className="panel" style={{ flex: 1, borderRight: '1px solid var(--border)' }}>
              <div className="panel-header">Graph Canvas</div>
              <div className="panel-body">
                <GraphPanel />
              </div>
            </div>

            {/* Resize Handle Right */}
            <div
              style={{ width: '4px', cursor: 'col-resize', backgroundColor: 'transparent', transition: 'background 0.2s', zIndex: 10 }}
              onMouseDown={(e) => startResizing('right')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            />

            {/* Right: Code Editor */}
            <div className="panel" style={{ width: `${rightWidth}%`, borderRight: 'none' }}>
              <div className="panel-header">Code Viewer</div>
              <div className="panel-body code-panel-bg">
                <CodePanel />
              </div>
            </div>
          </div>

          {/* Resize Handle Bottom */}
          <div
            style={{ height: '4px', cursor: 'row-resize', backgroundColor: 'transparent', transition: 'background 0.2s', zIndex: 10 }}
            onMouseDown={(e) => startResizing('bottom')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          />

          {/* Bottom: Terminal */}
          <div className="panel" style={{ height: `${bottomHeight}%`, borderRight: 'none', borderTop: '1px solid var(--border)' }}>
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
