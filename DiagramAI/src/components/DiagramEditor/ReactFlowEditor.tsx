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
      const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null
      onNodeSelect?.(selectedNode)
      onSelectionChange?.({ nodes: selectedNodes, edges: selectedEdges })
    },
    [onNodeSelect, onSelectionChange]
  )

  // Drag and Drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')

      if (!type) return

      try {
        const nodeData = JSON.parse(type)

        // Use screenToFlowPosition to convert screen coordinates to flow coordinates
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const newNode: Node = {
          id: `${nodeData.type}-${Date.now()}`,
          type: nodeData.type,
          position,
          data: {
            label: nodeData.data?.label || `New ${nodeData.type}`,
            ...nodeData.data
          },
        }

        setNodes((nds) => nds.concat(newNode))
        onNodesChange?.(nodes.concat(newNode))
      } catch (error) {
        console.error('Error parsing dropped node data:', error)
      }
    },
    [screenToFlowPosition, nodes, onNodesChange, setNodes]
  )

  return (
    <div
      className="w-full h-full"
      ref={reactFlowWrapper}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
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
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        selectNodesOnDrag={false}
      >
        <Background
          color="#e5e7eb"
          gap={20}
          size={1}
          variant="dots"
        />
        <Controls
          position="top-right"
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
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
