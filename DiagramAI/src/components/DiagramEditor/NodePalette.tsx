'use client'

import React from 'react'

interface NodePaletteProps {
  onNodeAdd: (nodeType: string, nodeData: any) => void
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const nodeTemplates = [
    {
      type: 'start',
      label: 'Start',
      icon: '▶️',
      description: 'Start point of the process',
      data: { label: 'Start', icon: '▶️' }
    },
    {
      type: 'process',
      label: 'Process',
      icon: '⚙️',
      description: 'Process or action step',
      data: { label: 'Process', icon: '⚙️' }
    },
    {
      type: 'decision',
      label: 'Decision',
      icon: '❓',
      description: 'Decision or branching point',
      data: { label: 'Decision?', icon: '❓' }
    },
    {
      type: 'end',
      label: 'End',
      icon: '⏹️',
      description: 'End point of the process',
      data: { label: 'End', icon: '⏹️' }
    },
  ]

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      data: nodeData
    }))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Node Palette</h3>
      
      <div className="space-y-2">
        {nodeTemplates.map((template) => (
          <div
            key={template.type}
            className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, template.type, template.data)}
            onClick={() => onNodeAdd(template.type, template.data)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{template.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {template.label}
                </div>
                <div className="text-xs text-gray-500">
                  {template.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Instructions</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Click to add to center</p>
          <p>• Drag to position</p>
          <p>• Connect with handles</p>
        </div>
      </div>
    </div>
  )
}
