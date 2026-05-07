# MASTER_PROMPT.md - Graphite Visual IDE Development Guidelines

## Project Philosophy
Graphite is a local-first visual IDE that combines a real terminal, a live software graph, and a code inspector. It is NOT a chatbot wrapper, generic AI IDE, simple workflow editor, or NotebookLM clone. Instead, it is a visual runtime environment for understanding, navigating, and executing software systems while coding with external AI agents accessed through the terminal.

## Core Architecture
- **Terminal-First Design**: The terminal is the intelligence layer where external AI agents operate (Claude Code, Gemini CLI, etc.)
- **Visual Layer**: The IDE provides visualization, orchestration, architecture mapping, execution visibility, and system understanding
- **Graph-Centric**: The React Flow canvas is the core product - a dynamic visualization system for software architecture, not a static diagram
- **Modular Architecture**: Clear separation of concerns between terminal, graph, and code panels
- **State Management**: Zustand store for graph state with persistence to project.graph.json
- **Communication**: WebSocket for real-time terminal interaction, REST API for file operations

## Current Technology Stack
- **Frontend**: React 18 + Vite 5 + Tailwind CSS
- **Terminal**: xterm.js renderer + child_process.spawn backend over WebSocket
- **Graph Canvas**: React Flow (@xyflow/react)
- **Code Viewer**: Monaco Editor via @monaco-editor/react
- **Backend**: Node.js + Express + ws (WebSocket library)
- **State**: Zustand 4
- **Persistence**: project.graph.json auto-save every 60 seconds
- **Build**: Vite 5 with React plugin

## Graph Philosophy & Design Principles

### Progressive Disclosure
Never show all complexity at once. Reveal information gradually based on:
- zoom level
- selection
- focus
- search
- execution state
- expanded groups

### Multi-Level Abstraction
The graph supports multiple architectural levels:
- **LEVEL 1 - SYSTEM VIEW**: High-level architecture (Frontend, Backend, Database, Services)
- **LEVEL 2 - MODULE VIEW**: Expands systems into domains/modules (Dashboard, Payments, User Management)
- **LEVEL 3 - FILE VIEW**: Detailed file-level visualization (dashboard.jsx, auth.js, routes.ts)
- **LEVEL 4 - RUNTIME VIEW**: Execution-focused mode (terminal commands, active services, workflow execution)
- **LEVEL 5 - DEPENDENCY VIEW**: Relationship analysis mode (imports, dependency chains, circular dependencies)

### Auto-Organization & Contextual Visibility
The graph must eventually organize itself automatically through:
- clustering by folder/service/domain
- smart layouts
- dependency grouping
- architecture-aware positioning

Contextual visibility prioritizes:
- active nodes
- running workflows
- recently changed files
- executing services
- AI-modified files
- git-dirty files
- highly connected systems

## Current Implementation Status

### Completed Phases
- **Phase 2**: Project scaffold and layout (Explorer → Graph → Code → Terminal)
- **Phase 4**: Interface panels (terminal, graph, code viewers)
- **Phase 5**: Graph-file system integration (clicking nodes opens files in Monaco)

### Working Systems
- Professional IDE layout with resizable panels
- VS Code-style File Explorer with folder expansion
- Stable terminal using child_process.spawn (resolved posix_spawnp issues)
- Monaco Editor with dark theme and lazy loading
- React Flow graph canvas with custom node types
- File system backend with API for read/write operations
- Graph persistence with auto-save/load to project.graph.json
- Bidirectional WebSocket terminal communication
- Graph-file integration (clicking file nodes opens in Monaco)
- File Explorer synchronization with graph selection
- Panel resizing with smooth transitions
- Selected file tracking in graph state

### Resolved Issues
- posix_spawnp failed → Switched to child_process.spawn
- Terminal dimensions error → Added requestAnimationFrame and default sizes
- WebSocket flapping → Implemented exponential backoff reconnect
- Layout inversion → Corrected resize logic
- Invalid package config → Repaired package.json
- Graph-file integration → Clickable nodes with file loading
- File Explorer sync → Selection updates graph and code viewer
- API routing → Proper /api/ endpoints with Vite proxy configuration
- Terminal resize → Protected fitAddon.fit() with requestAnimationFrame

## Development Rules & Constraints

### Performance Requirements
- Lazy load Monaco Editor to prevent blocking initial render
- Never load files >300kb into Monaco
- Virtualize logs (when implemented)
- Debounce graph saves (already implemented at 60 seconds)
- Batch terminal updates
- Clean up listeners and sockets
- Avoid unnecessary React Flow re-renders
- Use React.memo for node components
- Never pass inline object props to nodes
- Prevent memory leaks
- Keep UI responsive during terminal streaming

### Architectural Constraints
- NEVER reintroduce built-in AI providers (Ollama, OpenRouter, Anthropic)
- Terminal remains the AI execution environment for external agents
- Preserve VS Code-inspired professional UI direction
- Maintain graph as live projection of software architecture (not static diagram editor)
- Keep modular boundaries between terminal, graph, and code panels
- Preserve Zustand architecture for state management
- Maintain WebSocket for terminal communication
- Preserve REST API for file operations with proper JSON responses

### UI/UX Philosophy
- VS Code inspired, modern desktop engineering tool
- Calm, restrained, professional appearance
- High information density with subtle contrast
- Minimal visual noise - avoid playful UI, oversized rounded corners, flashy animations
- Use subtle borders, muted backgrounds, restrained shadows, compact spacing
- Monaco editor remains dark theme
- Main UI uses muted dark/light-neutral colors
- Smooth but minimal transitions
- Professional desktop-app aesthetics

## Current Development Priorities

### Immediate Next Steps
1. **Implementation of "Run Workflow" logic in the Graph Panel**
   - Enable workflow execution triggering from graph nodes
   - Visualize workflow execution state in the graph
   - Connect workflow execution to terminal commands

2. **Workflow Execution Visualization & Control**
   - Show active workflows in the graph with visual indicators
   - Provide controls to start/pause/stop workflows
   - Display workflow progress and results

3. **Final UI/UX Polish & Performance Optimization**
   - Refine visual consistency across panels
   - Optimize re-renders and performance bottlenecks
   - Polish interaction details and feedback
   - Ensure responsive behavior under load

### Future Development Stages
- **Phase 6**: Runtime view implementation (execution-focused graph mode)
- **Phase 7**: Dependency analysis view (relationship and bottleneck visualization)
- **Phase 8**: Auto-organization and smart layout systems
- **Phase 9**: Advanced contextual visibility systems
- **Phase 10**: Electron desktop wrapper integration

## Critical Reminders for Future Development
- The terminal is the intelligence layer - do NOT rebuild AI provider systems
- Preserve the graph as the central interface for understanding software systems
- Maintain clean, professional aesthetics - avoid cyberpunk or playful styling
- Keep performance as a first-class consideration in all implementations
- Respect modular boundaries between system components
- All new features must align with the terminal-first, model-agnostic architecture
- Documentation must be kept current with implementation changes