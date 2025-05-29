'use client'

import React, { useState, useCallback } from 'react'
import { Node, Edge } from '@xyflow/react'
import { DiagramEditor } from './DiagramEditor'
import { MermaidEditor } from './MermaidEditor'

interface UnifiedDiagramEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  initialMermaidSyntax?: string
  onSave?: (data: { nodes: Node[], edges: Edge[], mermaidSyntax: string }) => void
  readOnly?: boolean
}

export const UnifiedDiagramEditor: React.FC<UnifiedDiagramEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  initialMermaidSyntax = '',
  onSave,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'mermaid'>('visual')
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [mermaidSyntax, setMermaidSyntax] = useState(initialMermaidSyntax || `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`)

  const handleSave = useCallback(() => {
    onSave?.({
      nodes,
      edges,
      mermaidSyntax
    })
  }, [nodes, edges, mermaidSyntax, onSave])

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes)
  }, [])

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges)
  }, [])

  const handleMermaidChange = useCallback((newSyntax: string) => {
    setMermaidSyntax(newSyntax)
  }, [])

  const handleConvertToMermaid = useCallback(() => {
    // Simple conversion from React Flow to Mermaid
    // This is a basic implementation - full conversion would be more complex
    let mermaidCode = 'graph TD\n'
    
    nodes.forEach((node) => {
      const nodeId = node.id
      const label = node.data?.label || 'Node'
      mermaidCode += `    ${nodeId}[${label}]\n`
    })
    
    edges.forEach((edge) => {
      const label = edge.label ? `|${edge.label}|` : ''
      mermaidCode += `    ${edge.source} -->${label} ${edge.target}\n`
    })
    
    setMermaidSyntax(mermaidCode)
    setActiveTab('mermaid')
  }, [nodes, edges])

  const handleConvertToVisual = useCallback(() => {
    // Simple conversion from Mermaid to React Flow
    // This is a placeholder - full parsing would be more complex
    setActiveTab('visual')
  }, [])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('visual')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'visual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎨 Visual Editor
          </button>
          <button
            onClick={() => setActiveTab('mermaid')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mermaid'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📝 Mermaid Code
          </button>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {activeTab === 'visual' ? 'Visual Diagram Editor' : 'Mermaid Text Editor'}
          </span>
          {activeTab === 'visual' && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Nodes: {nodes.length}</span>
              <span>•</span>
              <span>Connections: {edges.length}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeTab === 'visual' && (
            <button
              onClick={handleConvertToMermaid}
              className="btn-secondary text-sm"
              title="Convert visual diagram to Mermaid syntax"
            >
              📝 To Mermaid
            </button>
          )}
          {activeTab === 'mermaid' && (
            <button
              onClick={handleConvertToVisual}
              className="btn-secondary text-sm"
              title="Convert Mermaid syntax to visual diagram"
            >
              🎨 To Visual
            </button>
          )}
          <button
            onClick={handleSave}
            className="btn-primary text-sm"
          >
            💾 Save
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1">
        {activeTab === 'visual' ? (
          <DiagramEditor
            initialNodes={nodes}
            initialEdges={edges}
            onSave={(newNodes, newEdges) => {
              setNodes(newNodes)
              setEdges(newEdges)
              handleSave()
            }}
            readOnly={readOnly}
          />
        ) : (
          <MermaidEditor
            initialSyntax={mermaidSyntax}
            onSyntaxChange={handleMermaidChange}
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  )
}
