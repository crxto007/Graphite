import React, { memo } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges
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
        border: '1px solid #E0E0E0',
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
        <div style={{ fontWeight: 500, color: '#202124' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: '#5F6368' }}>File</div>
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
      border: '1px solid #E0E0E0',
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
        <div style={{ fontWeight: 500, color: '#202124' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: '#5F6368' }}>AI Prompt</div>
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
      border: '1px solid #E0E0E0',
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
        <div style={{ fontWeight: 500, color: '#202124' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: '#5F6368' }}>Terminal Command</div>
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
      border: '1px solid #E0E0E0',
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
        <div style={{ fontWeight: 500, color: '#202124' }}>{data.label}</div>
        <div style={{ fontSize: '11px', color: '#5F6368' }}>HTTP Request</div>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default function GraphPanel() {
  const { 
    nodes, 
    edges, 
    setSelectedFilePath, 
    runTerminalCommand, 
    setNodes, 
    setEdges,
    isExecuting,
    executionQueue,
    currentExecutingNodeId,
    executionResults,
    startExecution,
    pauseExecution,
    stopExecution,
    setExecutionQueue,
    setCurrentExecutingNodeId,
    setExecutionResult,
    clearExecution
  } = useGraphStore(state => ({
    nodes: state.nodes,
    edges: state.edges,
    setSelectedFilePath: state.setSelectedFilePath,
    runTerminalCommand: state.runTerminalCommand,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    isExecuting: state.isExecuting,
    executionQueue: state.executionQueue,
    currentExecutingNodeId: state.currentExecutingNodeId,
    executionResults: state.executionResults,
    startExecution: state.startExecution,
    pauseExecution: state.pauseExecution,
    stopExecution: state.stopExecution,
    setExecutionQueue: state.setExecutionQueue,
    setCurrentExecutingNodeId: state.setCurrentExecutingNodeId,
    setExecutionResult: state.setExecutionResult,
    clearExecution: state.clearExecution
  }));

  const onNodesChange = (changes) => {
    setNodes(applyNodeChanges(changes, nodes));
  };
  const onEdgesChange = (changes) => {
    setEdges(applyEdgeChanges(changes, edges));
  };

  const onConnect = (params) => setEdges((eds) => eds.concat(params));

  const handleRunWorkflow = () => {
    // Get terminal nodes and execute them in order
    const terminalNodes = nodes.filter(node => node.type === 'terminal');
    
    if (terminalNodes.length === 0) {
      alert('No terminal nodes found in the workflow');
      return;
    }
    
    // Start execution
    startExecution();
    setExecutionQueue(terminalNodes);
    
    // Execute each node in sequence
    terminalNodes.forEach((node, index) => {
      // Set current executing node
      setCurrentExecutingNodeId(node.id);
      
      // Extract the command from the node's label or data
      const command = node.data.label || node.label;
      
      // Execute with a small delay between commands for better UX
      setTimeout(() => {
        runTerminalCommand(command);
        
        // Mark as completed after execution (in a real implementation, we'd wait for output)
        setTimeout(() => {
          setExecutionResult(node.id, {
            status: 'completed',
            timestamp: new Date().toISOString()
          });
          
          // Move to next node or finish
          if (index === terminalNodes.length - 1) {
            // Last node - finish execution
            setTimeout(() => {
              setExecutionResult(node.id, {
                status: 'completed',
                timestamp: new Date().toISOString()
              });
              // Execution complete
            }, 100);
          }
        }, 300); // Simulate execution time
      }, index * 1000); // 1 second delay between commands
    });
  };

  const handlePauseExecution = () => {
    pauseExecution();
  };

  const handleStopExecution = () => {
    stopExecution();
  };

  const handleClearExecution = () => {
    clearExecution();
  };

  // Get node style based on execution state
  const getNodeStyle = (node) => {
    const isCurrent = node.id === currentExecutingNodeId;
    const hasResult = executionResults[node.id];
    const isInQueue = executionQueue.some(n => n.id === node.id);
    
    let baseStyle = {
      background: 'white',
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      width: '180px',
      fontSize: '13px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 150ms ease'
    };
    
    if (isCurrent) {
      // Currently executing - blue pulse
      return {
        ...baseStyle,
        border: '2px solid #1A73E8',
        boxShadow: '0 0 0 3px rgba(26, 115, 232, 0.2)',
        backgroundColor: '#F0F8FF'
      };
    } else if (hasResult) {
      // Completed - green check
      return {
        ...baseStyle,
        border: '1px solid #34A853',
        boxShadow: '0 0 0 2px rgba(52, 168, 83, 0.2)',
        backgroundColor: '#F0FFF8'
      };
    } else if (isInQueue) {
      // In queue - yellow highlight
      return {
        ...baseStyle,
        border: '1px solid #FBBC04',
        boxShadow: '0 0 0 2px rgba(251, 188, 4, 0.2)',
        backgroundColor: '#FFFEF0'
      };
    } else {
      // Normal state
      return baseStyle;
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', background: '#FAFBFC', position: 'relative' }}>
      {/* Execution Controls */}
      <div style={{ 
        position: 'absolute', 
        top: '12px', 
        left: '12px', 
        zIndex: 10, 
        display: 'flex', 
        gap: '8px' 
      }}>
        <button
          onClick={handleRunWorkflow}
          disabled={isExecuting}
          style={{
            height: '32px',
            padding: '0 16px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
            backgroundColor: 'white',
            color: '#202124',
            cursor: !isExecuting ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          {isExecuting ? 'Running...' : 'Run Workflow'}
        </button>
        <button
          onClick={handlePauseExecution}
          disabled={!isExecuting}
          style={{
            height: '32px',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
            backgroundColor: 'white',
            color: '#202124',
            cursor: !isExecuting ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          Pause
        </button>
        <button
          onClick={handleStopExecution}
          disabled={!isExecuting}
          style={{
            height: '32px',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
            backgroundColor: 'white',
            color: '#202124',
            cursor: !isExecuting ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          Stop
        </button>
        <button
          onClick={handleClearExecution}
          disabled={!isExecuting && Object.keys(executionResults).length === 0 && executionQueue.length === 0}
          style={{
            height: '32px',
            padding: '0 12px',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
            backgroundColor: 'white',
            color: '#202124',
            cursor: !isExecuting ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          Clear
        </button>
      </div>

      {/* Execution Status */}
      <div style={{ 
        position: 'absolute', 
        top: '12px', 
        right: '12px', 
        zIndex: 10, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
      }}>
        {isExecuting && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '13px', 
            color: "#202124"
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#1A73E8', 
              animation: 'pulse 1.5s infinite' 
            }}></div>
            <span>Executing workflow...</span>
          </div>
        )}
        {!isExecuting && executionQueue.length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '13px', 
            color: "#FBBC04"
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#FBBC04' 
            }}></div>
            <span>{executionQueue.length} items in queue</span>
          </div>
        )}
        {!isExecuting && executionQueue.length === 0 && Object.keys(executionResults).length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '13px', 
            color: "#34A853"
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#34A853' 
            }}></div>
            <span>Workflow completed</span>
          </div>
        )}
      </div>

      {/* React Flow Container */}
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          zoomOnDoubleClick
          zoomOnWheel={true}
          panOnDrag={true}
          panOnScroll={false}
          paneStyle={{ 
            backgroundColor: '#FAFBFC' 
          }}
        >
          <Background color="#FFFFFF" gap={24} />
          <Controls 
            style={{ 
              position: 'absolute', 
              bottom: '24px', 
              left: '24px' 
            }} 
          />
        </ReactFlow>
      </div>
    </div>
  );
}
