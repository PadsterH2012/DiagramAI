'use client'

import React, { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface ReactFlowViewerProps {
  content: {
    nodes?: Node[]
    edges?: Edge[]
  }
}

// Simple viewer component without hooks
export default function ReactFlowViewer({ content }: ReactFlowViewerProps) {
  if (!content || (!content.nodes && !content.edges)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">📊 No diagram content</p>
          <p className="text-gray-400 text-sm">This diagram appears to be empty</p>
        </div>
      </div>
    )
  }

  const nodes = content.nodes || []
  const edges = content.edges || []

  return (
    <div className="w-full h-full relative">
      {/* View Mode Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>👁️</span>
          <span>View Mode</span>
        </div>
      </div>

      {/* Stats Indicator */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
        <div className="text-xs text-gray-500">
          {nodes.length} nodes • {edges.length} edges
        </div>
      </div>

      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          preventScrolling={false}
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls
            position="bottom-right"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
