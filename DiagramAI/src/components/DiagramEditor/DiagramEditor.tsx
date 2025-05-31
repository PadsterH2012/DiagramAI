'use client'

import React, { useState, useCallback } from 'react'
import { Node, Edge } from '@xyflow/react'
import { ReactFlowEditor } from './ReactFlowEditor'
import { SlideOutMenu } from './SlideOutMenu'
import { MovableChatbox } from './MovableChatbox'
import { CompactNodePropertiesPanel } from './CompactNodePropertiesPanel'
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel'
import { NodeContextMenu } from './NodeContextMenu'
import { featureFlags } from '../../lib/featureFlags'

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
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [showHelpPanel, setShowHelpPanel] = useState(false)
  const [showChatbox, setShowChatbox] = useState(false)
  const [showSlideOutMenu, setShowSlideOutMenu] = useState(false)
  const [clipboard, setClipboard] = useState<{ nodes: Node[], edges: Edge[] } | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wasExplicitlyCleared, setWasExplicitlyCleared] = useState(false)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    node: Node | null
    position: { x: number; y: number }
    isVisible: boolean
  }>({
    node: null,
    position: { x: 0, y: 0 },
    isVisible: false
  })

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

  // Use current state, fall back to defaults only if no initial nodes provided and state is empty and not explicitly cleared
  const currentNodes = nodes.length > 0 ? nodes : (wasExplicitlyCleared ? [] : (initialNodes.length > 0 ? initialNodes : defaultNodes))
  const currentEdges = edges.length > 0 ? edges : (wasExplicitlyCleared ? [] : (initialEdges.length > 0 ? initialEdges : defaultEdges))

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes)
    // Reset cleared state when nodes are added
    if (newNodes.length > 0 && wasExplicitlyCleared) {
      setWasExplicitlyCleared(false)
    }
  }, [wasExplicitlyCleared])

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

  const handleNodeUpdate = useCallback((nodeId: string, updates: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    )
  }, [])

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node)
    if (node) {
      setShowPropertiesPanel(true)
    }
  }, [])

  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setShowPropertiesPanel(true)
  }, [])

  // Selection handlers
  const handleSelectionChange = useCallback((selection: { nodes: Node[], edges: Edge[] }) => {
    setSelectedNodes(selection.nodes)
    setSelectedEdges(selection.edges)
    if (selection.nodes.length === 1) {
      setSelectedNode(selection.nodes[0])
    } else {
      setSelectedNode(null)
    }
  }, [])

  // Delete functionality
  const handleDelete = useCallback(() => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      const selectedNodeIds = selectedNodes.map(node => node.id)
      const selectedEdgeIds = selectedEdges.map(edge => edge.id)

      // Remove selected nodes and edges
      setNodes(prevNodes => prevNodes.filter(node => !selectedNodeIds.includes(node.id)))
      setEdges(prevEdges => prevEdges.filter(edge =>
        !selectedEdgeIds.includes(edge.id) &&
        !selectedNodeIds.includes(edge.source) &&
        !selectedNodeIds.includes(edge.target)
      ))

      // Clear selection
      setSelectedNodes([])
      setSelectedEdges([])
      setSelectedNode(null)
    }
  }, [selectedNodes, selectedEdges])

  // Copy functionality
  const handleCopy = useCallback(() => {
    if (selectedNodes.length > 0) {
      const relatedEdges = edges.filter(edge =>
        selectedNodes.some(node => node.id === edge.source) &&
        selectedNodes.some(node => node.id === edge.target)
      )

      setClipboard({
        nodes: selectedNodes,
        edges: relatedEdges
      })
    }
  }, [selectedNodes, edges])

  // Paste functionality
  const handlePaste = useCallback(() => {
    if (clipboard) {
      const nodeIdMap = new Map<string, string>()

      // Create new nodes with new IDs
      const newNodes = clipboard.nodes.map(node => {
        const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        nodeIdMap.set(node.id, newId)
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50, // Offset pasted nodes
            y: node.position.y + 50
          },
          selected: false
        }
      })

      // Create new edges with updated node references
      const newEdges = clipboard.edges.map(edge => ({
        ...edge,
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: nodeIdMap.get(edge.source) || edge.source,
        target: nodeIdMap.get(edge.target) || edge.target,
        selected: false
      }))

      setNodes(prevNodes => [...prevNodes, ...newNodes])
      setEdges(prevEdges => [...prevEdges, ...newEdges])

      // Select the pasted nodes
      setSelectedNodes(newNodes)
      setSelectedEdges(newEdges)
    }
  }, [clipboard])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return // Don't handle shortcuts when typing in inputs
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      handleDelete()
    } else if (event.key === '?' || event.key === 'F1') {
      event.preventDefault()
      setShowHelpPanel(!showHelpPanel)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setSelectedNodes([])
      setSelectedEdges([])
      setSelectedNode(null)
      setShowHelpPanel(false)
    } else if (event.ctrlKey || event.metaKey) {
      if (event.key === 'c') {
        event.preventDefault()
        handleCopy()
      } else if (event.key === 'v') {
        event.preventDefault()
        handlePaste()
      } else if (event.key === 'a') {
        event.preventDefault()
        setSelectedNodes(nodes)
        setSelectedEdges(edges)
      } else if (event.key === 's') {
        event.preventDefault()
        handleSave()
      }
    }
  }, [handleDelete, handleCopy, handlePaste, nodes, edges])

  // Add keyboard event listeners
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSave = useCallback(async () => {
    try {
      await onSave?.(currentNodes, currentEdges)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Save failed:', error)
    }
  }, [currentNodes, currentEdges, onSave])

  const handleClear = useCallback(() => {
    const confirmed = confirm('Are you sure you want to clear all nodes and connections?')
    if (confirmed) {
      setNodes([])
      setEdges([])
      setWasExplicitlyCleared(true)
      setSelectedNodes([])
      setSelectedEdges([])
      setSelectedNode(null)
    }
  }, [])

  // Context menu handlers
  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault()
    event.stopPropagation()

    setContextMenu({
      node,
      position: { x: event.clientX, y: event.clientY },
      isVisible: true
    })

    // Select the node when right-clicking
    setSelectedNode(node)
    setSelectedNodes([node])
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isVisible: false }))
  }, [])

  const handleContextMenuProperties = useCallback(() => {
    if (contextMenu.node) {
      setSelectedNode(contextMenu.node)
      setShowPropertiesPanel(true)
    }
  }, [contextMenu.node])

  const handleContextMenuDelete = useCallback(() => {
    if (contextMenu.node) {
      const nodeId = contextMenu.node.id
      setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId))
      setEdges(prevEdges => prevEdges.filter(edge =>
        edge.source !== nodeId && edge.target !== nodeId
      ))
      setSelectedNodes([])
      setSelectedEdges([])
      setSelectedNode(null)
    }
  }, [contextMenu.node])

  const handleContextMenuCopy = useCallback(() => {
    if (contextMenu.node) {
      setClipboard({
        nodes: [contextMenu.node],
        edges: edges.filter(edge =>
          edge.source === contextMenu.node!.id || edge.target === contextMenu.node!.id
        )
      })
    }
  }, [contextMenu.node, edges])

  const handleContextMenuDuplicate = useCallback(() => {
    if (contextMenu.node) {
      const newNode: Node = {
        ...contextMenu.node,
        id: `node-${Date.now()}`,
        position: {
          x: contextMenu.node.position.x + 50,
          y: contextMenu.node.position.y + 50
        },
        selected: false
      }
      setNodes(prevNodes => [...prevNodes, newNode])
    }
  }, [contextMenu.node])

  return (
    <div className="flex h-full bg-white relative">
      {/* Slide-out Menu */}
      {!readOnly && (
        <SlideOutMenu 
          onNodeAdd={handleNodeAdd} 
          isOpen={showSlideOutMenu}
          onToggle={setShowSlideOutMenu}
        />
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
              {selectedNodes.length > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  Selected: {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''}
                  {selectedEdges.length > 0 && `, ${selectedEdges.length} edge${selectedEdges.length !== 1 ? 's' : ''}`}
                </span>
              )}
              {lastSaved && (
                <span className="text-xs text-green-600">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          {!readOnly && (
            <div className="flex items-center space-x-2">
              {/* AI Chat Action */}
              <div className="flex items-center space-x-1">
                {featureFlags.aiChat && (
                  <button
                    onClick={() => setShowChatbox(!showChatbox)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      showChatbox
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                    title="AI Assistant"
                  >
                    🤖 AI Chat
                  </button>
                )}

                <button
                  onClick={() => setShowHelpPanel(!showHelpPanel)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    showHelpPanel
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                  title="Keyboard Shortcuts (? or F1)"
                >
                  ❓ Help
                </button>
              </div>

              {/* Diagram Actions */}
              <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                <button
                  onClick={handleSave}
                  className="btn-primary text-sm"
                >
                  💾 Save Diagram
                </button>
              </div>
            </div>
          )}
        </div>

        {/* React Flow Editor */}
        <div className="flex-1 relative bg-white p-6">
          <div className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <ReactFlowEditor
              initialNodes={currentNodes}
              initialEdges={currentEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeSelect={handleNodeSelect}
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodeContextMenu={handleNodeContextMenu}
              onSelectionChange={handleSelectionChange}
              readOnly={readOnly}
              onCopy={handleCopy}
              onPaste={handlePaste}
              onDelete={handleDelete}
              onShowProperties={() => setShowPropertiesPanel(!showPropertiesPanel)}
              onShowHelp={() => setShowHelpPanel(!showHelpPanel)}
              onClearAll={handleClear}
              onNodeAdd={handleNodeAdd}
              onOpenNodePalette={() => {
                setShowSlideOutMenu(true)
              }}
              selectedNodes={selectedNodes}
              selectedEdges={selectedEdges}
              clipboard={clipboard}
              showPropertiesPanel={showPropertiesPanel}
              showHelpPanel={showHelpPanel}
            />
          </div>

          {/* Node Properties Panel */}
          {showPropertiesPanel && (
            <CompactNodePropertiesPanel
              selectedNode={selectedNode}
              onNodeUpdate={handleNodeUpdate}
              onClose={() => {
                setShowPropertiesPanel(false)
                setSelectedNode(null)
              }}
            />
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help Panel */}
      <KeyboardShortcutsPanel
        isOpen={showHelpPanel}
        onClose={() => setShowHelpPanel(false)}
      />

      {/* Movable Chatbox */}
      {featureFlags.aiChat && (
        <MovableChatbox
          isOpen={showChatbox}
          onToggle={() => setShowChatbox(!showChatbox)}
        />
      )}

      {/* Node Context Menu */}
      <NodeContextMenu
        node={contextMenu.node}
        position={contextMenu.position}
        isVisible={contextMenu.isVisible}
        onClose={handleCloseContextMenu}
        onShowProperties={handleContextMenuProperties}
        onDelete={handleContextMenuDelete}
        onCopy={handleContextMenuCopy}
        onDuplicate={handleContextMenuDuplicate}
      />
    </div>
  )
}
