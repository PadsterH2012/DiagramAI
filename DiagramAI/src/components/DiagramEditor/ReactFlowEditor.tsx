'use client'

import React, { useCallback, useMemo, useState } from 'react'
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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// Custom Node Components
import { ProcessNode } from './Nodes/ProcessNode'
import { DecisionNode } from './Nodes/DecisionNode'
import { StartNode } from './Nodes/StartNode'
import { EndNode } from './Nodes/EndNode'

interface ReactFlowEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  readOnly?: boolean
  collaborativeMode?: boolean
}

export const ReactFlowEditor: React.FC<ReactFlowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  readOnly = false,
  collaborativeMode = false,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)

  // Custom node types
  const nodeTypes = useMemo(() => ({
    process: ProcessNode,
    decision: DecisionNode,
    start: StartNode,
    end: EndNode,
  }), [])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'default',
        animated: false,
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

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  )
}
