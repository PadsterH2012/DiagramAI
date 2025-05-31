'use client'

import React, { useState, useCallback } from 'react'
import { Node, Edge } from '@xyflow/react'
import { DiagramEditor } from './DiagramEditor'
import { MermaidEditor } from './MermaidEditor'
import SaveDialog, { SaveDialogData } from './SaveDialog'
import { diagramService, DiagramData } from '../../services/diagramService'

// Mermaid to ReactFlow conversion utility
function parseMermaidToReactFlow(mermaidSyntax: string): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const nodeMap = new Map<string, { id: string, label: string, shape: string }>()

  console.log('🔧 Parsing Mermaid syntax:', mermaidSyntax.substring(0, 200) + '...')

  // Split into lines and clean up
  const lines = mermaidSyntax.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  // Skip the first line if it's a graph declaration
  const contentLines = lines.filter(line => !line.match(/^(graph|flowchart|sequenceDiagram|gantt|pie)/i))

  console.log('🔧 Content lines to parse:', contentLines.length)

  // Parse each line for nodes and connections
  contentLines.forEach((line, index) => {
    console.log(`🔧 Parsing line ${index + 1}:`, line)

    // Enhanced connection patterns to handle more complex syntax
    const connectionPatterns = [
      // More flexible pattern for complex node definitions
      /([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^}]+\}|\([^)]+\)|\(\([^)]+\)\))\s*-->\s*(\|[^|]+\|)?\s*([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^}]+\}|\([^)]+\)|\(\([^)]+\)\))?/,
      // Simple ID to ID with shapes
      /([A-Za-z0-9_]+)\s*-->\s*(\|[^|]+\|)?\s*([A-Za-z0-9_]+)/,
      // Other arrow types
      /([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^}]+\}|\([^)]+\)|\(\([^)]+\)\))\s*->\s*(\|[^|]+\|)?\s*([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^}]+\}|\([^)]+\)|\(\([^)]+\)\))?/,
    ]

    let matched = false
    for (const pattern of connectionPatterns) {
      const match = line.match(pattern)
      if (match) {
        console.log('🔧 Pattern matched:', match)

        let sourceId, sourceShape, edgeLabel, targetId, targetShape

        if (match.length >= 6) {
          // Full match with shapes
          [, sourceId, sourceShape = '', edgeLabel = '', targetId, targetShape = ''] = match
        } else {
          // Simple match
          [, sourceId, edgeLabel = '', targetId] = match
          sourceShape = ''
          targetShape = ''
        }

        // Extract node labels and shapes
        const sourceLabel = extractNodeLabel(sourceId, sourceShape)
        const targetLabel = extractNodeLabel(targetId, targetShape)
        const sourceNodeShape = getNodeShape(sourceShape)
        const targetNodeShape = getNodeShape(targetShape)

        console.log('🔧 Extracted:', { sourceId, sourceLabel, targetId, targetLabel })

        // Add nodes to map
        if (!nodeMap.has(sourceId)) {
          nodeMap.set(sourceId, { id: sourceId, label: sourceLabel, shape: sourceNodeShape })
        }
        if (!nodeMap.has(targetId)) {
          nodeMap.set(targetId, { id: targetId, label: targetLabel, shape: targetNodeShape })
        }

        // Add edge
        const cleanEdgeLabel = edgeLabel.replace(/^\||\|$/g, '').trim()
        edges.push({
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          label: cleanEdgeLabel || undefined,
          type: 'smoothstep'
        })

        matched = true
        break
      }
    }

    // If no connection found, check for standalone node definitions
    if (!matched) {
      const standaloneMatch = line.match(/([A-Za-z0-9_]+)(\[[^\]]+\]|\{[^}]+\}|\([^)]+\)|\(\([^)]+\)\))/)
      if (standaloneMatch) {
        const [, nodeId, nodeShape] = standaloneMatch
        const label = extractNodeLabel(nodeId, nodeShape)
        const shape = getNodeShape(nodeShape)

        console.log('🔧 Standalone node:', { nodeId, label, shape })

        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, { id: nodeId, label, shape })
        }
      }
    }
  })

  console.log('🔧 Total nodes found:', nodeMap.size)
  console.log('🔧 Total edges found:', edges.length)

  // Convert nodes map to ReactFlow nodes with hierarchical layout
  const nodeEntries = Array.from(nodeMap.entries())

  // Try to create a more logical layout based on connections
  const { positions } = calculateHierarchicalLayout(nodeEntries, edges)

  nodeEntries.forEach(([id, nodeData], index) => {
    const position = positions[id] || { x: (index % 5) * 250 + 100, y: Math.floor(index / 5) * 150 + 100 }

    nodes.push({
      id,
      type: nodeData.shape,
      position,
      data: {
        label: nodeData.label
      }
    })
  })

  return { nodes, edges }
}

// Calculate better layout based on graph structure
function calculateHierarchicalLayout(nodeEntries: [string, any][], edges: Edge[]): { positions: Record<string, { x: number, y: number }> } {
  const positions: Record<string, { x: number, y: number }> = {}

  // Simple hierarchical layout - find root nodes (no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target))
  const rootNodes = nodeEntries.filter(([id]) => !hasIncoming.has(id)).map(([id]) => id)

  if (rootNodes.length === 0) {
    // Fallback to grid layout
    nodeEntries.forEach(([id], index) => {
      const cols = Math.ceil(Math.sqrt(nodeEntries.length))
      positions[id] = {
        x: (index % cols) * 250 + 100,
        y: Math.floor(index / cols) * 150 + 100
      }
    })
    return { positions }
  }

  // Place root nodes at the top
  rootNodes.forEach((id, index) => {
    positions[id] = {
      x: index * 300 + 100,
      y: 100
    }
  })

  // Place other nodes in layers
  const visited = new Set(rootNodes)
  let currentLayer = [...rootNodes]
  let layerY = 100

  while (currentLayer.length > 0) {
    const nextLayer: string[] = []
    layerY += 200

    currentLayer.forEach(nodeId => {
      const outgoingEdges = edges.filter(e => e.source === nodeId)
      outgoingEdges.forEach((edge, index) => {
        if (!visited.has(edge.target)) {
          visited.add(edge.target)
          nextLayer.push(edge.target)

          // Position relative to parent
          const parentPos = positions[nodeId]
          positions[edge.target] = {
            x: parentPos.x + (index - outgoingEdges.length / 2) * 200,
            y: layerY
          }
        }
      })
    })

    currentLayer = nextLayer
  }

  // Place any remaining unvisited nodes
  nodeEntries.forEach(([id], index) => {
    if (!positions[id]) {
      positions[id] = {
        x: (index % 3) * 250 + 100,
        y: layerY + 200
      }
    }
  })

  return { positions }
}

function extractNodeLabel(nodeId: string, shape: string): string {
  if (!shape) return nodeId

  // Extract label from various Mermaid shapes - handle complex text with spaces, underscores, etc.
  const labelMatch = shape.match(/[\[\{\(]([^[\]{}()]+)[\]\}\)]/)
  if (labelMatch) {
    // Clean up the label - replace underscores with spaces, handle special characters
    let label = labelMatch[1].trim()
    label = label.replace(/_/g, ' ')  // Replace underscores with spaces
    label = label.replace(/\s+/g, ' ')  // Normalize multiple spaces
    return label
  }

  // If no shape brackets, return the nodeId with underscores replaced
  return nodeId.replace(/_/g, ' ')
}

function getNodeShape(shape: string): string {
  if (!shape) return 'default'

  if (shape.includes('{') && shape.includes('}')) return 'diamond'
  if (shape.includes('((') && shape.includes('))')) return 'circle'
  if (shape.includes('(') && shape.includes(')')) return 'ellipse'
  return 'default' // Rectangle/box
}

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

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleSaveWithDialog = useCallback(async (saveData: SaveDialogData) => {
    setSaveStatus('saving')
    try {
      const diagramData: DiagramData = {
        title: saveData.title,
        description: saveData.description,
        content: {
          nodes,
          edges,
        },
        format: 'reactflow',
        tags: saveData.tags,
        isPublic: saveData.isPublic,
        isFavorite: saveData.isFavorite,
        projectId: saveData.projectId,
      }

      const result = await diagramService.autoSave(diagramData)
      
      if (result.success) {
        onSave?.({
          nodes,
          edges,
          mermaidSyntax,
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        throw new Error(result.error || 'Save failed')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      throw error // Re-throw to let the dialog handle it
    }
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
    // Parse Mermaid syntax and convert to React Flow nodes and edges
    try {
      const { nodes: parsedNodes, edges: parsedEdges } = parseMermaidToReactFlow(mermaidSyntax)
      setNodes(parsedNodes)
      setEdges(parsedEdges)
      setActiveTab('visual')
    } catch (error) {
      console.error('Failed to convert Mermaid to visual:', error)
      // Still switch to visual tab even if parsing fails
      setActiveTab('visual')
    }
  }, [mermaidSyntax])

  return (
    <div className="flex flex-col h-full bg-white" data-testid="unified-diagram-editor">
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
            onClick={() => setShowSaveDialog(true)}
            disabled={saveStatus === 'saving'}
            className={`text-sm px-4 py-2 rounded-md font-medium transition-colors ${
              saveStatus === 'saving'
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : saveStatus === 'saved'
                ? 'bg-green-600 text-white'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saveStatus === 'saving' && '⏳ Saving...'}
            {saveStatus === 'saved' && '✅ Saved!'}
            {saveStatus === 'error' && '❌ Error'}
            {saveStatus === 'idle' && '💾 Save Diagram'}
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
              setShowSaveDialog(true)
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

      {/* Save Dialog */}
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveWithDialog}
        initialData={{
          title: `Diagram ${new Date().toLocaleDateString()}`,
          description: '',
          tags: [],
          isPublic: false,
          isFavorite: false,
          projectId: null,
        }}
      />
    </div>
  )
}
