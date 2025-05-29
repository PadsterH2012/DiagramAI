'use client'

import React, { useState, useCallback } from 'react'
import { Node, Edge } from '@xyflow/react'
import { ReactFlowEditor } from './ReactFlowEditor'
import { NodePalette } from './NodePalette'

interface DiagramEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onSave?: (nodes: Node[], edges: Edge[]) => void
  readOnly?: boolean
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
  readOnly = false,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedTool, setSelectedTool] = useState<string>('select')

  // Sample initial nodes for demo
  const defaultNodes: Node[] = [
    {
      id: '1',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Start', icon: '▶️' },
    },
    {
      id: '2',
      type: 'process',
      position: { x: 250, y: 150 },
      data: { label: 'Process Data', icon: '⚙️' },
    },
    {
      id: '3',
      type: 'decision',
      position: { x: 250, y: 250 },
      data: { label: 'Valid?', icon: '❓' },
    },
    {
      id: '4',
      type: 'end',
      position: { x: 150, y: 350 },
      data: { label: 'Success', icon: '✅' },
    },
    {
      id: '5',
      type: 'end',
      position: { x: 350, y: 350 },
      data: { label: 'Error', icon: '❌' },
    },
  ]

  const defaultEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4', label: 'Yes' },
    { id: 'e3-5', source: '3', target: '5', label: 'No' },
  ]

  // Use default nodes/edges if none provided
  const currentNodes = nodes.length > 0 ? nodes : defaultNodes
  const currentEdges = edges.length > 0 ? edges : defaultEdges

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes)
  }, [])

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges)
  }, [])

  const handleNodeAdd = useCallback((nodeType: string, nodeData: any) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: nodeData,
    }
    setNodes((prevNodes) => [...prevNodes, newNode])
  }, [])

  const handleSave = useCallback(() => {
    onSave?.(currentNodes, currentEdges)
  }, [currentNodes, currentEdges, onSave])

  const handleClear = useCallback(() => {
    setNodes([])
    setEdges([])
  }, [])

  const handleReset = useCallback(() => {
    setNodes(defaultNodes)
    setEdges(defaultEdges)
  }, [])

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Panel - Node Palette */}
      {!readOnly && (
        <NodePalette onNodeAdd={handleNodeAdd} />
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Visual Editor</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Nodes: {currentNodes.length}
              </span>
              <span className="text-sm text-gray-600">
                Connections: {currentEdges.length}
              </span>
            </div>
          </div>
          
          {!readOnly && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="btn-secondary text-sm"
              >
                Reset Demo
              </button>
              <button
                onClick={handleClear}
                className="btn-secondary text-sm"
              >
                Clear All
              </button>
              <button
                onClick={handleSave}
                className="btn-primary text-sm"
              >
                Save Diagram
              </button>
            </div>
          )}
        </div>

        {/* React Flow Editor */}
        <div className="flex-1">
          <ReactFlowEditor
            initialNodes={currentNodes}
            initialEdges={currentEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  )
}
