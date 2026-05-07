import React, { Suspense, useState, useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';

// Lazy load Monaco Editor to prevent blocking initial render
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

export default function CodePanel() {
  const [fileContent, setFileContent] = useState('// Select a node to view its code');
  const [fileName, setFileName] = useState('no-file-selected.txt');
  const [isLoading, setIsLoading] = useState(false);
  const selectedFilePath = useGraphStore(state => state.selectedFilePath);
  const files = useGraphStore(state => state.files);

  // Load file content when selectedFilePath changes
  useEffect(() => {
    if (selectedFilePath && files[selectedFilePath]) {
      // File content is already in store (from graph load or update)
      setFileContent(files[selectedFilePath]);
      setFileName(selectedFilePath.split('/').pop() || 'unknown');
      setIsLoading(false);
    } else if (selectedFilePath) {
      // Need to fetch file from backend
      setIsLoading(true);
      fetch(`/api/file?path=${encodeURIComponent(selectedFilePath)}`)
        .then(response => {
          if (!response.ok) throw new Error('Failed to load file');
          return response.json();
        })
        .then(data => {
          setFileContent(data.content);
          setFileName(selectedFilePath.split('/').pop() || 'unknown');
          // Also update the files store for future reference
          // Note: We don't auto-save here as that would be handled by explicit save actions
          useGraphStore.getState().updateFile(selectedFilePath, data.content);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error loading file:', error);
          setFileContent(`// Error loading file: ${error.message}`);
          setIsLoading(false);
        });
    } else {
      // No file selected
      setFileContent('// Select a node to view its code');
      setFileName('no-file-selected.txt');
      setIsLoading(false);
    }
  }, [selectedFilePath]);

  const handleEditorChange = (value) => {
    setFileContent(value);
    // Update the files store with current content
    useGraphStore.getState().updateFile(selectedFilePath, value);
    // In Phase 5 we will add the auto-save logic here
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div className="code-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{fileName}</span>
          {isLoading && <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading...</span>}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Suspense fallback={<div style={{ color: 'white', padding: '20px' }}>Loading Editor...</div>}>
          <MonacoEditor
            height="100%"
            width="100%"
            language="javascript"
            theme="vs-dark"
            value={fileContent}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono',
              minimap: { enabled: false },
              scrollBeyondTopOfPage: false,
              automaticLayout: true,
              padding: { top: 10 }
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
