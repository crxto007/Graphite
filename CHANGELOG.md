# CHANGELOG

All notable changes to this project will be documented in this file.

## [Unreleased]
- Initial project setup
- Created project structure with backend and frontend directories
- Set up React + Vite with Tailwind CSS using custom color palette
- Configured Express backend with WebSocket support
- Created AI provider modules (Ollama, OpenRouter, Anthropic) with fallback mechanism
- Built basic UI components: status bar, panel headers, chat input, agent log, settings panel
- Created three main panels: terminal, graph, and code viewer
- Set up Zustand stores for state management
- Configured Vite proxy for API requests
- Added environment variables for API keys
- Added graph-file system integration: clicking a file node in the graph opens the file in Monaco Code Viewer
- Added file explorer synchronization: selecting a file in the explorer updates graph selection and code viewer
- Enhanced graph state management to track selected file path
- Made file nodes in the graph clickable with visual feedback
- Fixed terminal WebSocket instability with exponential backoff reconnect (already implemented)
- Fixed xterm.js dimensions error with requestAnimationFrame protection in resize handler
- Fixed CodePanel API route to use /api/file endpoint with proper Vite proxy configuration
- Fixed graph autosave 404 errors by updating backend routes to use /api/ prefix
- Updated project architecture documentation to reflect terminal-first, model-agnostic design
- Removed all references to built-in AI providers (Ollama, OpenRouter, Anthropic) from codebase and documentation
- Created MASTER_PROMPT.md as authoritative continuation guide for future development sessions
- Implemented Phase 5: Graph-File Integration with workflow execution capabilities
  - Added file watcher system with debounce for efficient file monitoring
  - Implemented parser system for detecting file changes and workflow triggers
  - Added WebSocket-based workflow execution with visualization
  - Enhanced graph store with workflow state management
  - Added workflow execution controls (play, pause, stop, step)
  - Implemented workflow testing framework with descriptors
  - Added utility functions for file operations and workflow management
  - Created test suites for workflow execution and file watching systems

## [1.0.0] - 2026-05-07
### Added
- Initial project scaffold
- All core components and services
- Documentation files (README, CLAUDE, PROGRESS, CHANGELOG)

### Changed
- None


### Deprecated
- None

### Removed
- None

### Fixed
- None
