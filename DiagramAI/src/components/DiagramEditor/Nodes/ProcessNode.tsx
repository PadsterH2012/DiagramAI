'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface ProcessNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const ProcessNode = memo(({ data, selected, id }: NodeProps & { data: ProcessNodeData }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || '')

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
      // Update node data here - would need to be passed from parent
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    // Update node data here
  }

  return (
    <div className={`
      px-4 py-3 shadow-md rounded-md border-2 min-w-[150px] max-w-[250px]
      ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300'}
      hover:shadow-lg transition-all duration-200
      bg-gradient-to-br from-blue-50 to-blue-100
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

      <div className="flex items-center space-x-3">
        {data.icon && (
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium shadow-sm"
            style={{ backgroundColor: data.color || '#3b82f6' }}
          >
            <span className="text-base">{data.icon}</span>
          </div>
        )}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              className="text-sm font-medium bg-transparent border-none outline-none w-full text-gray-900"
              autoFocus
            />
          ) : (
            <div
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-700"
              onDoubleClick={handleDoubleClick}
            >
              {label}
            </div>
          )}
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">
              {data.description}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

      {/* Additional connection handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  )
})

ProcessNode.displayName = 'ProcessNode'
