'use client'

import React, { useState } from 'react'

interface NodePaletteProps {
  onNodeAdd: (nodeType: string, nodeData: any) => void
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const [activeCategory, setActiveCategory] = useState('basic')

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
          type: 'process',
          label: 'Process',
          icon: '⚙️',
          description: 'Process or action step',
          data: { label: 'Process', icon: '⚙️', color: '#3b82f6' }
        },
        {
          type: 'decision',
          label: 'Decision',
          icon: '❓',
          description: 'Decision or branching point',
          data: { label: 'Decision?', icon: '❓', color: '#f59e0b' }
        },
        {
          type: 'end',
          label: 'End',
          icon: '⏹️',
          description: 'End point of the process',
          data: { label: 'End', icon: '⏹️', color: '#ef4444' }
        },
      ]
    },
    flowchart: {
      label: 'Flowchart',
      icon: '📊',
      nodes: [
        {
          type: 'input',
          label: 'Input',
          icon: '📥',
          description: 'Data input or user input',
          data: { label: 'Input', icon: '📥', color: '#8b5cf6' }
        },
        {
          type: 'output',
          label: 'Output',
          icon: '📤',
          description: 'Data output or display',
          data: { label: 'Output', icon: '📤', color: '#06b6d4' }
        },
        {
          type: 'database',
          label: 'Database',
          icon: '🗄️',
          description: 'Database operation',
          data: { label: 'Database', icon: '🗄️', color: '#84cc16' }
        },
        {
          type: 'document',
          label: 'Document',
          icon: '📄',
          description: 'Document or report',
          data: { label: 'Document', icon: '📄', color: '#f97316' }
        },
      ]
    },
    system: {
      label: 'System',
      icon: '🖥️',
      nodes: [
        {
          type: 'server',
          label: 'Server',
          icon: '🖥️',
          description: 'Server or service',
          data: { label: 'Server', icon: '🖥️', color: '#6366f1' }
        },
        {
          type: 'api',
          label: 'API',
          icon: '🔌',
          description: 'API endpoint',
          data: { label: 'API', icon: '🔌', color: '#ec4899' }
        },
        {
          type: 'cloud',
          label: 'Cloud',
          icon: '☁️',
          description: 'Cloud service',
          data: { label: 'Cloud', icon: '☁️', color: '#14b8a6' }
        },
        {
          type: 'user',
          label: 'User',
          icon: '👤',
          description: 'User or actor',
          data: { label: 'User', icon: '👤', color: '#f59e0b' }
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
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      data: nodeData
    }))
    event.dataTransfer.effectAllowed = 'move'
  }

  const currentCategory = nodeCategories[activeCategory as keyof typeof nodeCategories]

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Node Palette</h3>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(nodeCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
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
      </div>

      {/* Node List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {currentCategory.nodes.map((template) => (
            <div
              key={template.type}
              className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-all hover:shadow-md group"
              draggable
              onDragStart={(e) => onDragStart(e, template.type, template.data)}
              onClick={() => onNodeAdd(template.type, template.data)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: template.data.color }}
                >
                  {template.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {template.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {template.description}
                  </div>
                </div>
                <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Drag or Click
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          💡 Drag nodes to canvas or click to add at center
        </div>
      </div>
    </div>
  )
}
