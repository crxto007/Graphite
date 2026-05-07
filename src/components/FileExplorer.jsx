import React, { useState } from 'react';
import { useGraphStore } from '../store/graphStore';

export default function FileExplorer() {
  const [expandedFolders, setExpandedFolders] = useState({
    'backend': true,
    'src': true,
    'backend-ai': true
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const setSelectedFilePath = useGraphStore(state => state.setSelectedFilePath);
  const selectedFilePathFromStore = useGraphStore(state => state.selectedFilePath);

  // Sync local selectedFile state with store
  // When store changes, update local state (but not vice versa to avoid loops)
  // We'll handle this in the selectFile function instead

  const initialFiles = [
    { id: 'backend', name: 'backend', type: 'folder', children: [
      { id: 'backend-index', name: 'index.js', type: 'file' },
      { id: 'backend-files', name: 'files.js', type: 'file' },
      { id: 'backend-ai', name: 'ai', type: 'folder', children: [
        { id: 'router', name: 'router.js', type: 'file' },
        { id: 'ollama', name: 'ollama.js', type: 'file' },
        { id: 'openrouter', name: 'openrouter.js', type: 'file' },
        { id: 'anthropic', name: 'anthropic.js', type: 'file' },
      ]}
    ]},
    { id: 'src', name: 'src', type: 'folder', children: [
      { id: 'src-app', name: 'App.jsx', type: 'file' },
      { id: 'src-main', name: 'main.jsx', type: 'file' },
      { id: 'src-css', name: 'index.css', type: 'file' },
      { id: 'src-panels', name: 'panels', type: 'folder', children: [
        { id: 'p-term', name: 'TerminalPanel.jsx', type: 'file' },
        { id: 'p-graph', name: 'GraphPanel.jsx', type: 'file' },
        { id: 'p-code', name: 'CodePanel.jsx', type: 'file' },
      ]},
      { id: 'src-comp', name: 'components', type: 'folder', children: [
        { id: 'c-exp', name: 'FileExplorer.jsx', type: 'file' },
      ]}
    ]},
    { id: 'pkg-json', name: 'package.json', type: 'file' },
    { id: 'claude-md', name: 'CLAUDE.md', type: 'file' },
    { id: 'prog-md', name: 'PROGRESS.md', type: 'file' },
    { id: 'changelog-md', name: 'CHANGELOG.md', type: 'file' },
  ];

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectFile = (id) => {
    setSelectedFile(id);
    // Also update the store so GraphPanel and CodePanel know about it
    // We need to map the file ID to an actual file path
    const filePathMap = {
      'backend-index': 'backend/index.js',
      'backend-files': 'backend/files.js',
      'router': 'backend/ai/router.js',
      'ollama': 'backend/ai/ollama.js',
      'openrouter': 'backend/ai/openrouter.js',
      'anthropic': 'backend/ai/anthropic.js',
      'src-app': 'src/App.jsx',
      'src-main': 'src/main.jsx',
      'src-css': 'src/index.css',
      'p-term': 'src/panels/TerminalPanel.jsx',
      'p-graph': 'src/panels/GraphPanel.jsx',
      'p-code': 'src/panels/CodePanel.jsx',
      'c-exp': 'src/components/FileExplorer.jsx',
      'pkg-json': 'package.json',
      'claude-md': 'CLAUDE.md',
      'prog-md': 'PROGRESS.md',
      'changelog-md': 'CHANGELOG.md'
    };

    const filePath = filePathMap[id];
    if (filePath) {
      setSelectedFilePath(filePath);
    }
  };

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = expandedFolders[node.id];
      const isSelected = selectedFile === node.id;

      return (
        <React.Fragment key={node.id}>
          <div
            onClick={() => isFolder ? toggleFolder(node.id) : selectFile(node.id)}
            style={{
              paddingLeft: `${depth * 12 + 12}px`,
              cursor: 'pointer',
              fontSize: '13px',
              paddingTop: '2px',
              paddingBottom: '2px',
              color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
              backgroundColor: isSelected ? 'rgba(26, 115, 232, 0.1)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              userSelect: 'none',
              transition: 'background-color 0.1s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{
              fontSize: '10px',
              width: '12px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              {isFolder ? (isExpanded ? '▼' : '▶') : ' '}
            </span>
            <span style={{ fontSize: '14px' }}>
              {isFolder ? '📁' : '📄'}
            </span>
            {node.name}
          </div>
          {isFolder && isExpanded && node.children && renderTree(node.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '10px 0' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        padding: '0 12px 8px 12px',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Workspace</span>
        <span style={{ cursor: 'pointer' }}>+</span>
      </div>
      <div style={{ paddingRight: '4px' }}>
        {renderTree(initialFiles)}
      </div>
    </div>
  );
}
