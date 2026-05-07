# Graphite

A visual runtime environment for AI-assisted software engineering.

Graphite combines:
- a real terminal
- a live software graph
- a code inspector
- workflow execution
- runtime visualization

into one synchronized workspace.

Instead of treating software as isolated files, Graphite visualizes systems, dependencies, execution flow, and architecture in real time.

---

## Philosophy

Graphite is built around one idea:

> Help developers understand software systems visually.

The goal is not to replace coding.
The goal is to make complex software systems:
- easier to navigate
- easier to understand
- easier to debug
- easier to reason about

Graphite is:
- terminal-first
- local-first
- model-agnostic

It works alongside tools like:
- Claude Code
- Gemini CLI
- Aider
- OpenCode
- future AI coding agents

rather than replacing them.

---

## Core Features

- Real terminal powered by xterm.js + node-pty
- Live software graph built with React Flow
- Monaco code editor integration
- File explorer synchronized with graph state
- Runtime-aware workflow execution
- Graph persistence and auto-save
- Visual node execution states
- Modular architecture designed for large-scale systems

---

## Current Status

Graphite is currently in active development.

Completed:
- Core layout system
- Terminal integration
- Graph rendering
- Monaco integration
- File explorer synchronization
- Panel resizing
- Zustand state architecture

In Progress:
- Runtime visualization
- Workflow execution
- Dependency mapping
- Graph intelligence
- Architecture clustering

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Zustand
- React Flow
- Monaco Editor
- xterm.js

### Backend
- Node.js
- Express
- WebSocket (ws)
- node-pty

### Desktop Wrapper (planned)
- Electron

---

## Design Philosophy

The interface is designed to:
- reduce cognitive load
- prioritize clarity
- stay visually restrained
- remain fast and lightweight

---

## Long-Term Vision

Graphite is evolving toward:
- live architecture visualization
- runtime-aware software maps
- dependency analysis
- execution tracing
- visual debugging
- AI-assisted workflow orchestration

The graph is not a diagram editor.

It is a live projection of software systems.

---

## Development

```bash
npm install
npm run dev
