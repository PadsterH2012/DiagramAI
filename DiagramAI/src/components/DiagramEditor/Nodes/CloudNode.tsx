'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface CloudNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const CloudNode = memo(({ data, selected, id }: NodeProps & { data: CloudNodeData }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || 'Cloud')

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  return (
    <div className={`
      relative px-6 py-4 shadow-md border-2 min-w-[160px] max-w-[250px]
      ${selected ? 'border-teal-500 ring-2 ring-teal-200' : 'border-teal-300'}
      hover:shadow-lg transition-all duration-200
      bg-gradient-to-br from-teal-50 to-teal-100
    `}
    style={{
      borderRadius: '50px 50px 50px 10px',
      clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
    }}>
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-teal-500 border-2 border-white"
      />
      
      <div className="flex items-center space-x-3">
        {data.icon && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm"
            style={{ backgroundColor: data.color || '#14b8a6' }}
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
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-teal-700"
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
        className="w-3 h-3 !bg-teal-500 border-2 border-white"
      />
      
      {/* Side handles */}
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 !bg-teal-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-teal-500 border-2 border-white"
      />
    </div>
  )
})

CloudNode.displayName = 'CloudNode'
