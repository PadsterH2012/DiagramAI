'use client'

import React, { useState } from 'react'

interface NodePaletteProps {
  onNodeAdd?: (nodeType: string, nodeData: any) => void
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const [activeCategory, setActiveCategory] = useState('basic')
  const [searchQuery, setSearchQuery] = useState('')

  const nodeCategories = {
    basic: {
      label: 'Basic',
      icon: '🔧',
      nodes: [
        {
          type: 'start',
          label: 'Start',
          icon: '▶️',
          description: 'Start point of the process',
          data: { label: 'Start', icon: '▶️', color: '#10b981' }
        },
        {
          type: 'end',
          label: 'End',
          icon: '⏹️',
          description: 'End point of the process',
          data: { label: 'End', icon: '⏹️', color: '#ef4444' }
        },
        {
          type: 'decision',
          label: 'Decision',
          icon: '❓',
          description: 'Decision or branching point',
          data: { label: 'Decision?', icon: '❓', color: '#f59e0b' }
        },
      ]
    },
    flowchart: {
      label: 'Flowchart',
      icon: '📊',
      nodes: [
        // Basic Process Symbols
        {
          type: 'process',
          label: 'Process',
          icon: '⚙️',
          description: 'Process or action step',
          data: { label: 'Process', icon: '⚙️', color: '#3b82f6' }
        },
        {
          type: 'start',
          label: 'Start/End',
          icon: '▶️',
          description: 'Terminal (start/end point)',
          data: { label: 'Start', icon: '▶️', color: '#10b981' }
        },
        {
          type: 'decision',
          label: 'Decision',
          icon: '❓',
          description: 'Decision or branching point',
          data: { label: 'Decision?', icon: '❓', color: '#f59e0b' }
        },
        {
          type: 'circle',
          label: 'Connector',
          icon: '⭕',
          description: 'Connector or junction point',
          data: { label: 'Connector', icon: '⭕', color: '#6b7280' }
        },
        {
          type: 'input',
          label: 'Input/Output',
          icon: '📥',
          description: 'Data input or output',
          data: { label: 'Input/Output', icon: '📥', color: '#8b5cf6' }
        },
        {
          type: 'hexagon',
          label: 'Preparation',
          icon: '⬡',
          description: 'Preparation step',
          data: { label: 'Prepare', icon: '⬡', color: '#7c3aed' }
        },
        // Data & Storage Symbols
        {
          type: 'database',
          label: 'Database',
          icon: '🗄️',
          description: 'Database or storage',
          data: { label: 'Database', icon: '🗄️', color: '#84cc16' }
        },
        {
          type: 'document',
          label: 'Document',
          icon: '📄',
          description: 'Document or report',
          data: { label: 'Document', icon: '📄', color: '#f97316' }
        },
        {
          type: 'multiple-documents',
          label: 'Multiple Docs',
          icon: '📑',
          description: 'Multiple documents',
          data: { label: 'Multi-Docs', icon: '📑', color: '#f97316' }
        },
        {
          type: 'stored-data',
          label: 'Stored Data',
          icon: '💾',
          description: 'Stored data file',
          data: { label: 'Stored Data', icon: '💾', color: '#059669' }
        },
        // Logic & Control Symbols
        {
          type: 'manual-operation',
          label: 'Manual Operation',
          icon: '✋',
          description: 'Manual operation step',
          data: { label: 'Manual Op', icon: '✋', color: '#f59e0b' }
        },
        {
          type: 'manual-input',
          label: 'Manual Input',
          icon: '⌨️',
          description: 'Manual input step',
          data: { label: 'Manual Input', icon: '⌨️', color: '#06b6d4' }
        },
        {
          type: 'predefined-process',
          label: 'Subroutine',
          icon: '📦',
          description: 'Predefined process',
          data: { label: 'Subroutine', icon: '📦', color: '#6366f1' }
        },
        {
          type: 'delay',
          label: 'Delay',
          icon: '⏱️',
          description: 'Wait or delay step',
          data: { label: 'Delay', icon: '⏱️', color: '#ef4444' }
        },
        // Advanced Symbols
        {
          type: 'cloud',
          label: 'Cloud Service',
          icon: '☁️',
          description: 'Cloud process or service',
          data: { label: 'Cloud', icon: '☁️', color: '#14b8a6' }
        },
      ]
    },
    network: {
      label: 'Network',
      icon: '🌐',
      nodes: [
        {
          type: 'server',
          label: 'Server',
          icon: '🖥️',
          description: 'Server or service',
          data: { label: 'Server', icon: '🖥️', color: '#6366f1' }
        },
        {
          type: 'router',
          label: 'Router',
          icon: '📡',
          description: 'Network router',
          data: { label: 'Router', icon: '📡', color: '#059669' }
        },
        {
          type: 'cloud',
          label: 'Cloud',
          icon: '☁️',
          description: 'Cloud service',
          data: { label: 'Cloud', icon: '☁️', color: '#14b8a6' }
        },
        {
          type: 'api',
          label: 'API',
          icon: '🔌',
          description: 'API endpoint',
          data: { label: 'API', icon: '🔌', color: '#ec4899' }
        },
      ]
    },
    system: {
      label: 'System',
      icon: '🖥️',
      nodes: [
        {
          type: 'user',
          label: 'User',
          icon: '👤',
          description: 'User or actor',
          data: { label: 'User', icon: '👤', color: '#f59e0b' }
        },
        {
          type: 'process',
          label: 'System',
          icon: '⚡',
          description: 'System component',
          data: { label: 'System', icon: '⚡', color: '#7c3aed' }
        },
        {
          type: 'database',
          label: 'Data Store',
          icon: '💾',
          description: 'Data storage',
          data: { label: 'Data Store', icon: '💾', color: '#16a34a' }
        },
        {
          type: 'api',
          label: 'Service',
          icon: '🔄',
          description: 'External service',
          data: { label: 'Service', icon: '🔄', color: '#dc2626' }
        },
      ]
    },
    shapes: {
      label: 'Shapes',
      icon: '🔷',
      nodes: [
        {
          type: 'rectangle',
          label: 'Rectangle',
          icon: '▭',
          description: 'Basic rectangle',
          data: { label: 'Rectangle', icon: '▭', color: '#6b7280' }
        },
        {
          type: 'circle',
          label: 'Circle',
          icon: '⭕',
          description: 'Basic circle',
          data: { label: 'Circle', icon: '⭕', color: '#6b7280' }
        },
        {
          type: 'diamond',
          label: 'Diamond',
          icon: '◆',
          description: 'Diamond shape',
          data: { label: 'Diamond', icon: '◆', color: '#6b7280' }
        },
        {
          type: 'note',
          label: 'Note',
          icon: '📝',
          description: 'Annotation or note',
          data: { label: 'Note', icon: '📝', color: '#fbbf24' }
        },
      ]
    }
  }

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    // Set both the standard text/plain and our custom format
    event.dataTransfer.setData('text/plain', nodeType)
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      data: nodeData
    }))
    event.dataTransfer.effectAllowed = 'move'
  }

  const currentCategory = nodeCategories[activeCategory as keyof typeof nodeCategories]

  // Filter nodes based on search query
  const filteredNodes = searchQuery 
    ? Object.values(nodeCategories).flatMap(category => 
        category.nodes.filter(node => 
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : currentCategory.nodes

  return (
    <div className="w-full flex flex-col h-full">
      {/* Search Box */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Category Tabs - Hide when searching */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-1 mb-3">
          {Object.entries(nodeCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                activeCategory === key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Results Header */}
      {searchQuery && (
        <div className="mb-2 text-sm text-gray-600">
          {filteredNodes.length} result{filteredNodes.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
        </div>
      )}

      {/* Node List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {filteredNodes.map((template) => (
            <div
              key={`${template.type}-${template.label}`}
              className="p-2 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-all hover:shadow-sm group"
              draggable
              onDragStart={(e) => onDragStart(e, template.type, template.data)}
              onClick={() => onNodeAdd?.(template.type, template.data)}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: template.data.color }}
                >
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700 truncate">
                    {template.label}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {template.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* No results message */}
          {searchQuery && filteredNodes.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <div className="text-sm">No nodes found</div>
              <div className="text-xs mt-1">Try a different search term</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
