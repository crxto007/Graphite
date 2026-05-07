# CLAUDE.md - Project Context

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Terminal: xterm.js (renderer) + node-pty (backend) over WebSocket
- Graph canvas: React Flow
- Code viewer: Monaco Editor via @monaco-editor/react
- Backend: Node.js + Express + ws
- AI: ollama npm package + OpenRouter via fetch (OpenAI-compatible) + Anthropic SDK
- State: Zustand
- Auto-save: project.graph.json written to disk every 60 seconds
- Desktop wrapper: Electron (added in final phase)

## Node Types and Colors
- File: Blue left accent bar (#1A73E8)
- AI Prompt: Purple left accent bar (not explicitly defined, but can use a purple shade)
- Terminal Command: Black left accent bar (#000000 or dark gray)
- HTTP Request: Green left accent bar (#34A853)

## AI Provider Priority Order
1. Ollama - local, free, no API key
2. OpenRouter - one API key, hundreds of models, very cheap
3. Anthropic - fallback only, used if both above are unavailable

## System Prompt for AI
"You are an AI coding assistant inside a visual IDE. When the user asks you to build something, respond with the code followed by a graph JSON block wrapped in <graph></graph> tags. The graph block must follow this exact format with no exceptions: { nodes: [{ id: string, label: string, type: 'module'|'database'|'api'|'file'|'service', filePath: string }], edges: [{ from: string, to: string, label: string }], files: { 'filename.js': 'full file content here' } }. Always include the graph block. Never skip it. Never wrap it in markdown fences. If your response contains no code, include an empty graph block with empty nodes edges and files arrays."

## Design Color Palette
- Background: #F8F9FA (soft off-white)
- Panel backgrounds: #FFFFFF with subtle #E8EAED borders between panels
- Primary accent: #1A73E8 (Google blue)
- Secondary accent: #34A853 (Google green)
- Warning: #FBBC04 (Google yellow)
- Error: #EA4335 (Google red)
- Text primary: #202124
- Text secondary: #5F6368
- Code viewer background: #1E1E2E (dark only for Monaco panel)

## Folder Descriptions
- backend/: Express server, WebSocket setup, file operations, AI provider routers
- backend/ai/: Individual AI provider implementations (Ollama, OpenRouter, Anthropic) and router
- src/: Main React application code
- src/components/: Reusable UI components (chat input, node types, agent log, settings panel, status bar)
- src/panels/: The three main panels (terminal, graph, code)
- src/store/: Zustand stores for graph state and settings
- public/: Static assets (if any)

## Known Issues Reference
- node-pty fails to install on Windows — requires Python and Visual Studio Build Tools. Fix: run npm install --global windows-build-tools as administrator first
- xterm.js shows garbled output — almost always a missing fitAddon. Fix: import and call fitAddon.fit() after the terminal mounts and on every window resize
- React Flow nodes disappear after state update — caused by passing a new array reference on every render. Fix: ensure nodes and edges arrays come from Zustand selectors with shallow equality
- Monaco causes white flash on load — caused by loading before theme is set. Fix: set beforeMount handler to define the theme before the editor mounts
- WebSocket disconnects after 30 seconds — caused by missing keepalive. Fix: send a ping message from client every 20 seconds and handle it silently on the server
- Ollama times out on first request — Ollama server needs a warm-up request. Fix: send a silent ping to http://localhost:11434 on app start and wait for response before marking it as available
- OpenRouter returns 401 — API key not set or whitespace in .env value. Fix: trim the key value when reading from process.env
- Port already in use on restart — previous session's server still running. Fix: the kill-ports script handles this, always run it before dev
- Graph auto-save causes lag — saving too frequently. Fix: debounce is already in graphStore — never remove it or shorten the 60 second interval
- Monaco on Windows shows wrong font — JetBrains Mono not installed. Fix: add a web font import for JetBrains Mono from Google Fonts as fallback