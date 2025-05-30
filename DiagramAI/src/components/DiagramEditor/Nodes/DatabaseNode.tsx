'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface DatabaseNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const DatabaseNode = memo(({ data, selected, id }: NodeProps & { data: DatabaseNodeData }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)

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
      relative px-4 py-3 shadow-md border-2 min-w-[150px] max-w-[250px]
      ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-300'}
      hover:shadow-lg transition-all duration-200
      bg-gradient-to-br from-green-50 to-green-100
      rounded-t-lg
    `}>
      {/* Database cylinder top */}
      <div className="absolute -top-2 left-0 right-0 h-4 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded-full"></div>
      
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500 border-2 border-white z-10"
      />
      
      <div className="flex items-center space-x-3 mt-2">
        {data.icon && (
          <div 
            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium shadow-sm"
            style={{ backgroundColor: data.color || '#84cc16' }}
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
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-green-700"
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
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
      
      {/* Side handles */}
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
    </div>
  )
})

DatabaseNode.displayName = 'DatabaseNode'
