# Project Progress - Visual IDE

## Current Status
- **Phase 2 (Project Scaffold & Layout):** COMPLETED ✅
- **AI System:** REMOVED (User decided to use Claude Code directly in the terminal)
- **Phase 4 (Interface Panels):** COMPLETED ✅
- **Phase 5 (Graph-File Integration):** COMPLETED ✅

## What is Working
- **Layout**: Professional IDE layout (Explorer $\to$ Graph $\to$ Code $\to$ Terminal) with resizable panels.
- **File Explorer**: VS Code-style tree view with collapsible folders and active file highlighting.
- **Terminal**: Stable WebSocket shell integration using `child_process.spawn` (compatible with macOS).
- **Code Viewer**: Monaco Editor integration with a dark theme and lazy loading.
- **Graph Canvas**: React Flow integration with custom node types.
- **File System**: Backend API for reading/writing files and saving/loading graph state.
- **Design System**: Clean, white/grey aesthetic evolving toward VS Code-inspired professional desktop app.
- **Graph-File Integration**: Clicking a file node in the graph opens the file in the Monaco Code Viewer.
- **File Explorer Sync**: Selecting a file in the File Explorer updates the graph selection and Code Viewer.
- **WebSocket Communication**: Stable bidirectional communication between frontend and backend.
- **Graph Persistence**: Auto-save and load of graph state to/from project.graph.json.
- **Terminal Input/Output**: Full terminal interaction via WebSocket.
- **File Loading**: Dynamic file fetching and display in Monaco Editor.
- **Panel Resizing**: smooth, intuitive resizing of all panels.
- **Selected File Tracking**: Graph state maintains currently selected file path.

## Decisions Made
- **AI-Free UI**: Removed all internal AI providers, settings panels, and status bars to avoid redundancy with Claude Code.
- **Terminal Fallback**: Switched from `node-pty` to `child_process.spawn` to resolve `posix_spawnp` failures on macOS.
- **Styling**: Used CSS Variables instead of pure Tailwind utilities for the core layout to ensure consistent rendering and avoid compiler issues.
- **Shell Selection**: Dynamic shell detection using `process.env.SHELL` with fallback to `/bin/zsh`.

## Errors Resolved
- **`posix_spawnp failed`**: Resolved by switching to `child_process.spawn`.
- **`dimensions` error**: Fixed by initializing xterm.js with a default size and using `requestAnimationFrame` for fitting.
- **WebSocket Flapping**: Implemented exponential backoff for terminal reconnection.
- **Layout Inversion**: Corrected the resize logic for intuitive panel expansion.
- **`ERR_INVALID_PACKAGE_CONFIG`**: Repaired corrupted `package.json`.

## Current File Structure
.
├── backend/
│   ├── files.js           # File I/O and Graph persistence
│   ├── index.js           # Express server & WebSocket coordinator
│   └── terminal.js        # Shell spawning logic
├── src/
│   ├── App.jsx            # Main Layout & Resize logic
│   ├── index.css          # Design system variables
│   ├── main.jsx           # React entry point
│   ├── components/
│   │   └── FileExplorer.jsx # VS Code-style tree
│   ├── panels/
│   │   ├── CodePanel.jsx   # Monaco Editor
│   │   ├── GraphPanel.jsx  # React Flow canvas
│   │   └── TerminalPanel.jsx # xterm.js renderer
│   └── store/
│       └── graphStore.js  # Zustand state for canvas
├── package.json
├── vite.config.js
├── tailwind.config.js
├── CLAUDE.md
└── PROGRESS.md

## Next Steps
- Implementation of the "Run Workflow" logic in the Graph Panel.
- Workflow execution visualization and control.
- Final UI/UX polish and performance optimization.

## Environment Snapshot
- OS: macOS
- Node version: v25.2.0
- npm version: 10.8.1
- Backend: Port 3000
- Frontend: Port 5173
- Git branch: main
- Build status: Successful
