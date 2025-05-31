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
import { createStyledEdge, connectionPresets } from '@/utils/edge-config'
import { QuickNodePopup } from './QuickNodePopup'

// Custom Node Components
import { ProcessNode } from './Nodes/ProcessNode'
import { DecisionNode } from './Nodes/DecisionNode'
import { StartNode } from './Nodes/StartNode'
import { EndNode } from './Nodes/EndNode'
import { InputNode } from './Nodes/InputNode'
import { DatabaseNode } from './Nodes/DatabaseNode'
import { CloudNode } from './Nodes/CloudNode'
import { DocumentNode } from './Nodes/DocumentNode'
import { ServerNode } from './Nodes/ServerNode'
import { RouterNode } from './Nodes/RouterNode'
// Professional Flowchart Symbols
import { HexagonNode } from './Nodes/HexagonNode'
import { ManualOperationNode } from './Nodes/ManualOperationNode'
import { ManualInputNode } from './Nodes/ManualInputNode'
import { DelayNode } from './Nodes/DelayNode'
import { PredefinedProcessNode } from './Nodes/PredefinedProcessNode'
import { MultipleDocumentsNode } from './Nodes/MultipleDocumentsNode'
import { StoredDataNode } from './Nodes/StoredDataNode'
import { InternalStorageNode } from './Nodes/InternalStorageNode'
import { SequentialDataNode } from './Nodes/SequentialDataNode'
import { ExtractNode } from './Nodes/ExtractNode'
import { OffPageConnectorNode } from './Nodes/OffPageConnectorNode'

interface ReactFlowEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onNodeSelect?: (node: Node | null) => void
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void
  onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void
  onSelectionChange?: (selection: { nodes: Node[], edges: Edge[] }) => void
  readOnly?: boolean
  collaborativeMode?: boolean
  // New action handlers for floating toolbar
  onCopy?: () => void
  onPaste?: () => void
  onDelete?: () => void
  onShowProperties?: () => void
  onShowHelp?: () => void
  onClearAll?: () => void
  onNodeAdd?: (nodeType: string, nodeData: any) => void
  onOpenNodePalette?: () => void
  selectedNodes?: Node[]
  selectedEdges?: Edge[]
  clipboard?: { nodes: Node[], edges: Edge[] } | null
  showPropertiesPanel?: boolean
  showHelpPanel?: boolean
}

// Main component that uses useReactFlow hook
const ReactFlowEditorWithProvider: React.FC<ReactFlowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onNodeDoubleClick,
  onNodeContextMenu,
  onSelectionChange,
  readOnly = false,
  collaborativeMode = false,
  // New action handlers
  onCopy,
  onPaste,
  onDelete,
  onShowProperties,
  onShowHelp,
  onClearAll,
  onNodeAdd,
  onOpenNodePalette,
  selectedNodes = [],
  selectedEdges = [],
  clipboard,
  showPropertiesPanel = false,
  showHelpPanel = false,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [interactionMode, setInteractionMode] = React.useState<'pan' | 'select'>('select')
  
  // Floating toolbar state
  const [toolbarPosition, setToolbarPosition] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diagram-floating-toolbar-position')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          // Invalid saved data, use default
        }
      }
    }
    return { x: window?.innerWidth ? window.innerWidth / 2 - 175 : 400, y: 20 }
  })
  const [isToolbarDragging, setIsToolbarDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [isToolbarExpanded, setIsToolbarExpanded] = React.useState(true)
  const [showQuickNodes, setShowQuickNodes] = React.useState(false)
  const toolbarRef = React.useRef<HTMLDivElement>(null)

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

  // Keyboard shortcuts for mode switching and quick node creation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        setInteractionMode('select')
      } else if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        setInteractionMode('pan')
      } else if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setShowQuickNodes(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Floating toolbar drag functionality
  const handleToolbarMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsToolbarDragging(true)
      // Calculate offset relative to current toolbar position, not bounding rect
      setDragOffset({
        x: e.clientX - toolbarPosition.x,
        y: e.clientY - toolbarPosition.y
      })
    }
  }, [toolbarPosition])

  const handleToolbarMouseMove = React.useCallback((e: MouseEvent) => {
    if (isToolbarDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      }

      // Constrain to viewport boundaries
      const toolbar = toolbarRef.current
      if (toolbar) {
        const rect = toolbar.getBoundingClientRect()
        const maxX = window.innerWidth - rect.width
        const maxY = window.innerHeight - rect.height

        newPosition.x = Math.max(0, Math.min(maxX, newPosition.x))
        newPosition.y = Math.max(0, Math.min(maxY, newPosition.y))
      }

      setToolbarPosition(newPosition)
    }
  }, [isToolbarDragging, dragOffset])

  const handleToolbarMouseUp = React.useCallback(() => {
    if (isToolbarDragging) {
      setIsToolbarDragging(false)
      // Save position to localStorage
      localStorage.setItem('diagram-floating-toolbar-position', JSON.stringify(toolbarPosition))
    }
  }, [isToolbarDragging, toolbarPosition])

  React.useEffect(() => {
    if (isToolbarDragging) {
      document.addEventListener('mousemove', handleToolbarMouseMove)
      document.addEventListener('mouseup', handleToolbarMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleToolbarMouseMove)
      document.removeEventListener('mouseup', handleToolbarMouseUp)
    }
  }, [isToolbarDragging, handleToolbarMouseMove, handleToolbarMouseUp])

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
    document: DocumentNode,
    server: ServerNode,
    router: RouterNode,
    api: ProcessNode, // Reuse ProcessNode with different styling
    cloud: CloudNode,
    user: ProcessNode, // Reuse ProcessNode with different styling
    rectangle: ProcessNode, // Reuse ProcessNode with different styling
    circle: StartNode, // Reuse StartNode with different styling
    diamond: DecisionNode, // Reuse DecisionNode with different styling
    note: ProcessNode, // Reuse ProcessNode with different styling
    // Professional Flowchart Symbols
    hexagon: HexagonNode,
    'manual-operation': ManualOperationNode,
    'manual-input': ManualInputNode,
    delay: DelayNode,
    'predefined-process': PredefinedProcessNode,
    'multiple-documents': MultipleDocumentsNode,
    'stored-data': StoredDataNode,
    'internal-storage': InternalStorageNode,
    'sequential-data': SequentialDataNode,
    extract: ExtractNode,
    'off-page-connector': OffPageConnectorNode,
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
          type: 'arrow' as const,
        },
      }
      
      setEdges((eds) => addEdge(newEdge, eds))
      onEdgesChange?.(edges)
    },
    [setEdges, onEdgesChange, edges]
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

  // Quick node creation functions
  const calculateOptimalPosition = useCallback(() => {
    const { x, y } = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    // Check for overlapping nodes and adjust position if needed
    const spacing = 150
    let optimalX = x
    let optimalY = y

    const isPositionOccupied = (checkX: number, checkY: number) => {
      return nodes.some(node => {
        const distance = Math.sqrt(
          Math.pow(node.position.x - checkX, 2) + 
          Math.pow(node.position.y - checkY, 2)
        )
        return distance < spacing
      })
    }

    // Try to find an unoccupied position in a spiral pattern
    let attempts = 0
    const maxAttempts = 16
    
    while (isPositionOccupied(optimalX, optimalY) && attempts < maxAttempts) {
      const angle = (attempts * Math.PI * 2) / 8 // 8 directions
      const radius = Math.ceil(attempts / 8) * spacing
      optimalX = x + Math.cos(angle) * radius
      optimalY = y + Math.sin(angle) * radius
      attempts++
    }

    return { x: optimalX, y: optimalY }
  }, [screenToFlowPosition, nodes])

  const handleQuickNodeAdd = useCallback((nodeType: string, nodeData: any) => {
    if (onNodeAdd) {
      onNodeAdd(nodeType, nodeData)
    } else {
      // Fallback to creating node directly if no onNodeAdd prop
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position: calculateOptimalPosition(),
        data: nodeData,
      }

      setNodes((prevNodes) => [...prevNodes, newNode])
      
      // Notify parent
      setTimeout(() => {
        onNodesChange?.([...nodes, newNode])
      }, 0)
    }
  }, [onNodeAdd, calculateOptimalPosition, setNodes, onNodesChange, nodes])

  const handleQuickNodeToggle = useCallback(() => {
    setShowQuickNodes(!showQuickNodes)
  }, [showQuickNodes])

  const handleQuickNodeClose = useCallback(() => {
    setShowQuickNodes(false)
  }, [])

  const handleViewAllNodes = useCallback(() => {
    setShowQuickNodes(false)
    onOpenNodePalette?.()
  }, [onOpenNodePalette])

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
        onNodeContextMenu={onNodeContextMenu}
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

        {/* Enhanced Floating Toolbar */}
        {!readOnly && (
          <div
            ref={toolbarRef}
            className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{
              left: toolbarPosition.x,
              top: toolbarPosition.y,
              cursor: isToolbarDragging ? 'grabbing' : 'default'
            }}
          >
            {/* Toolbar Header with Drag Handle */}
            <div
              className="drag-handle flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg cursor-grab select-none"
              onMouseDown={handleToolbarMouseDown}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-700">Tools</span>
              </div>
              <button
                onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
                className="p-1 hover:bg-gray-200 rounded text-gray-500 text-xs"
                title={isToolbarExpanded ? "Collapse toolbar" : "Expand toolbar"}
              >
                {isToolbarExpanded ? '−' : '+'}
              </button>
            </div>

            {/* Toolbar Content */}
            {isToolbarExpanded && (
              <div className="p-2">
                {/* Mode Selection Row */}
                <div className="flex items-center space-x-1 mb-2 pb-2 border-b border-gray-100">
                  <button
                    onClick={() => setInteractionMode('select')}
                    className={`p-2 rounded-md transition-colors ${
                      interactionMode === 'select'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Selection Mode (V)"
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
                    title="Pan Mode (H)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 1L8 6h3v6H5V9l-5 5 5 5v-3h6v6h-3l5 5 5-5h-3v-6h6v3l5-5-5-5v3h-6V6h3l-5-5z"/>
                    </svg>
                  </button>
                </div>

                {/* Quick Node Creation Row */}
                <div className="flex items-center space-x-1 mb-2 pb-2 border-b border-gray-100">
                  <button
                    onClick={handleQuickNodeToggle}
                    className="px-2 py-1 text-xs font-medium rounded transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                    title="Add Node (Ctrl+N)"
                  >
                    ➕
                  </button>
                </div>

                {/* Edit Actions Row */}
                <div className="flex items-center space-x-1 mb-2 pb-2 border-b border-gray-100">
                  <button
                    onClick={onCopy}
                    disabled={selectedNodes.length === 0}
                    className="px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200"
                    title="Copy (Ctrl+C)"
                  >
                    📋
                  </button>
                  <button
                    onClick={onPaste}
                    disabled={!clipboard}
                    className="px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200"
                    title="Paste (Ctrl+V)"
                  >
                    📎
                  </button>
                  <button
                    onClick={onDelete}
                    disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
                    className="px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-100 text-red-700 hover:bg-red-200"
                    title="Delete (Del)"
                  >
                    🗑️
                  </button>
                </div>

                {/* Panel Actions Row */}
                <div className="flex items-center space-x-1 mb-2 pb-2 border-b border-gray-100">
                  <button
                    onClick={onShowProperties}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      showPropertiesPanel
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Properties"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={onShowHelp}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      showHelpPanel
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Help (?)"
                  >
                    ❓
                  </button>
                </div>

                {/* Clear Action Row */}
                <div className="flex items-center">
                  <button
                    onClick={onClearAll}
                    className="px-2 py-1 text-xs font-medium rounded transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                    title="Clear All"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Quick Node Creation Popup */}
        {!readOnly && (
          <QuickNodePopup
            isOpen={showQuickNodes}
            onClose={handleQuickNodeClose}
            onNodeSelect={handleQuickNodeAdd}
            onViewAll={handleViewAllNodes}
            position={{
              x: toolbarPosition.x + 60, // Position relative to toolbar
              y: toolbarPosition.y + 120
            }}
          />
        )}
        
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
