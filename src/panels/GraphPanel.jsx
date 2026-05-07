import React, { memo } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  Background,
  Controls,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../store/graphStore';

// Custom Node Types
const nodeTypes = {
  file: FileNode,
  ai: AIPromptNode,
  terminal: TerminalNode,
  http: HTTPRequestNode,
};

function FileNode({ data }) {
  const setSelectedFilePath = useGraphStore(state => state.setSelectedFilePath);

  const handleClick = () => {
    if (data.filePath) {
      setSelectedFilePath(data.filePath);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        width: '180px',
        fontSize: '13px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'relative',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: '#1A73E8',
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
      }} />
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>File</div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function AIPromptNode({ data }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      width: '180px',
      fontSize: '13px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: '#A855F7',
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
      }} />
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AI Prompt</div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function TerminalNode({ data }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      width: '180px',
      fontSize: '13px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: '#000000',
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
      }} />
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Terminal Command</div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function HTTPRequestNode({ data }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      width: '180px',
      fontSize: '13px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: '#34A853',
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
      }} />
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>HTTP Request</div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default function GraphPanel() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const setSelectedFilePath = useGraphStore(state => state.setSelectedFilePath);

  const onConnect = (params) => setEdges((eds) => eds.concat(params));

  return (
    <div style={{ height: '100%', width: '100%', background: '#F8F9FA' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#ddd" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
