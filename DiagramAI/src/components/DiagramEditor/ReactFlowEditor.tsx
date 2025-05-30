'use client'

import React, { useCallback, useMemo, useState, useRef } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// Custom Node Components
import { ProcessNode } from './Nodes/ProcessNode'
import { DecisionNode } from './Nodes/DecisionNode'
import { StartNode } from './Nodes/StartNode'
import { EndNode } from './Nodes/EndNode'
import { InputNode } from './Nodes/InputNode'
import { DatabaseNode } from './Nodes/DatabaseNode'
import { CloudNode } from './Nodes/CloudNode'

interface ReactFlowEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onNodeSelect?: (node: Node | null) => void
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void
  onSelectionChange?: (selection: { nodes: Node[], edges: Edge[] }) => void
  readOnly?: boolean
  collaborativeMode?: boolean
}

// Main component that uses useReactFlow hook
const ReactFlowEditorWithProvider: React.FC<ReactFlowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onNodeDoubleClick,
  onSelectionChange,
  readOnly = false,
  collaborativeMode = false,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [interactionMode, setInteractionMode] = React.useState<'pan' | 'select'>('select')

  // Global drag detection
  React.useEffect(() => {
    const handleGlobalDragStart = (e: DragEvent) => {
      // Check if the drag has the types we expect from our node palette
      const types = Array.from(e.dataTransfer?.types || [])
      if (types.includes('text/plain') || types.includes('application/reactflow')) {
        setIsDragOver(true)
      }
    }

    const handleGlobalDragEnd = () => {
      setIsDragOver(false)
    }

    document.addEventListener('dragstart', handleGlobalDragStart)
    document.addEventListener('dragend', handleGlobalDragEnd)

    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart)
      document.removeEventListener('dragend', handleGlobalDragEnd)
    }
  }, [])

  // Keyboard shortcuts for mode switching
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        setInteractionMode('select')
      } else if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        setInteractionMode('pan')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sync with parent state when initialNodes/initialEdges change
  React.useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  React.useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  // Custom node types
  const nodeTypes = useMemo(() => ({
    process: ProcessNode,
    decision: DecisionNode,
    start: StartNode,
    end: EndNode,
    input: InputNode,
    output: InputNode, // Reuse InputNode with different styling
    database: DatabaseNode,
    document: ProcessNode, // Reuse ProcessNode with different styling
    server: ProcessNode, // Reuse ProcessNode with different styling
    api: ProcessNode, // Reuse ProcessNode with different styling
    cloud: CloudNode,
    user: ProcessNode, // Reuse ProcessNode with different styling
    rectangle: ProcessNode, // Reuse ProcessNode with different styling
    circle: StartNode, // Reuse StartNode with different styling
    diamond: DecisionNode, // Reuse DecisionNode with different styling
    note: ProcessNode, // Reuse ProcessNode with different styling
  }), [])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#374151',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#374151',
          width: 20,
          height: 20,
        },
        labelStyle: {
          fill: '#374151',
          fontWeight: 600,
          fontSize: 12,
        },
      }
      setEdges((eds) => addEdge(newEdge, eds))
      onEdgesChange?.(edges)
    },
    [edges, onEdgesChange, setEdges]
  )

  const onNodesChangeHandler = useCallback(
    (changes: any[]) => {
      onNodesChangeInternal(changes)
      onNodesChange?.(nodes)
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  )

  const onEdgesChangeHandler = useCallback(
    (changes: any[]) => {
      onEdgesChangeInternal(changes)
      onEdgesChange?.(edges)
    },
    [edges, onEdgesChange, onEdgesChangeInternal]
  )

  const onSelectionChangeHandler = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[], edges: Edge[] }) => {
      console.log('🔧 Selection changed:', {
        selectedNodes: selectedNodes.length,
        selectedEdges: selectedEdges.length,
        mode: interactionMode
      })
      const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null
      onNodeSelect?.(selectedNode)
      onSelectionChange?.({ nodes: selectedNodes, edges: selectedEdges })
    },
    [onNodeSelect, onSelectionChange, interactionMode]
  )

  // Drag and Drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    // Don't need to set isDragOver here since global handler manages it
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      // Don't manually reset isDragOver - global dragend handler will do it

      // Try to get data from both formats
      let nodeType = event.dataTransfer.getData('text/plain')
      let nodeDataStr = event.dataTransfer.getData('application/reactflow')

      // If we have the JSON data, use it; otherwise fall back to simple type
      if (!nodeType && !nodeDataStr) {
        return
      }

      try {
        let nodeData: any = {}

        if (nodeDataStr) {
          // Parse the full node data
          const parsedData = JSON.parse(nodeDataStr)
          nodeType = parsedData.type
          nodeData = parsedData.data || {}
        } else {
          // Use simple type with default data
          nodeData = { label: `New ${nodeType}`, color: '#6b7280' }
        }

        // Use screenToFlowPosition to convert screen coordinates to flow coordinates
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const newNode: Node = {
          id: `${nodeType}-${Date.now()}`,
          type: nodeType,
          position,
          data: {
            label: nodeData.label || `New ${nodeType}`,
            ...nodeData
          },
        }



        // Update local state
        setNodes((prevNodes) => [...prevNodes, newNode])

        // Notify parent in a separate effect to avoid state update during render
        setTimeout(() => {
          onNodesChange?.([...nodes, newNode])
        }, 0)
      } catch (error) {
        console.error('Error parsing dropped node data:', error)
      }
    },
    [screenToFlowPosition, onNodesChange, setNodes]
  )

  const onDragLeave = useCallback((event: React.DragEvent) => {
    // Global dragend handler manages the state, so we don't need to do anything here
    event.preventDefault()
  }, [])

  return (
    <div
      className="w-full h-full relative"
      ref={reactFlowWrapper}
    >
      {/* Invisible overlay to capture drag events - only for node drops from sidebar */}
      {isDragOver && (
        <div
          className="absolute inset-0 z-50"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={(e) => {
            e.preventDefault()
          }}
          onDragLeave={onDragLeave}
          style={{
            pointerEvents: 'auto'
          }}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onSelectionChange={onSelectionChangeHandler}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-white"
        data-pan-mode={interactionMode === 'pan'}
        nodesDraggable={!readOnly && interactionMode === 'select'}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly && interactionMode === 'select'}
        selectNodesOnDrag={false}
        selectionMode={interactionMode === 'select' ? SelectionMode.Partial : undefined}
        multiSelectionKeyCode={interactionMode === 'select' ? "Shift" : null}
        selectionKeyCode={null}
        deleteKeyCode={interactionMode === 'select' ? "Delete" : null}
        panOnDrag={interactionMode === 'pan'}
        panOnScroll={false}
        selectionOnDrag={interactionMode === 'select'}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
      >
        <Background
          color="#e5e7eb"
          gap={20}
          size={1}
        />
        <Controls
          position="top-right"
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />

        {/* Mode Toggle Toolbar */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white border border-gray-200 rounded-lg shadow-sm p-1 flex space-x-1">
          <button
            onClick={() => setInteractionMode('select')}
            className={`p-2 rounded-md transition-colors ${
              interactionMode === 'select'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Selection Mode (Create selection boxes) - Press 'V'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 2h6v6H2V2zm8 0h6v6h-6V2zm8 0h6v6h-6V2zM2 10h6v6H2v-6zm8 0h6v6h-6v-6zm8 0h6v6h-6v-6zM2 18h6v6H2v-6zm8 0h6v6h-6v-6zm8 0h6v6h-6v-6z"/>
            </svg>
          </button>
          <button
            onClick={() => setInteractionMode('pan')}
            className={`p-2 rounded-md transition-colors ${
              interactionMode === 'pan'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Pan Mode (Move the canvas) - Press 'H'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 1L8 6h3v6H5V9l-5 5 5 5v-3h6v6h-3l5 5 5-5h-3v-6h6v3l5-5-5-5v3h-6V6h3l-5-5z"/>
            </svg>
          </button>
        </div>
        <MiniMap
          nodeColor="#3b82f6"
          maskColor="rgba(255, 255, 255, 0.8)"
          position="bottom-right"
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
      </ReactFlow>
    </div>
  )
}

// Export the main component wrapped with ReactFlow provider
export const ReactFlowEditor: React.FC<ReactFlowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ReactFlowEditorWithProvider {...props} />
    </ReactFlowProvider>
  )
}
