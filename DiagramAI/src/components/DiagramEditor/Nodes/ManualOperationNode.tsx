'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface ManualOperationNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const ManualOperationNode = memo(({ data, selected, id }: NodeProps & { data: ManualOperationNodeData }) => {
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
    <div className="relative">
      {/* Pentagon shape using SVG */}
      <svg
        width="130"
        height="100"
        viewBox="0 0 130 100"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Pentagon path */}
        <polygon
          points="65,15 115,40 95,85 35,85 15,40"
          fill="url(#pentagonGradient)"
          stroke={selected ? data.color || '#f59e0b' : '#f97316'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="pentagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ left: '50%', top: '15px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ left: '20px', top: '45%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ right: '20px', top: '45%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ left: '50%', bottom: '15px', transform: 'translateX(-50%)' }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {data.icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mb-1"
            style={{ backgroundColor: data.color || '#f59e0b' }}
          >
            <span className="text-sm">{data.icon}</span>
          </div>
        )}
        <div className="text-center px-2 pointer-events-auto">
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              className="text-xs font-medium bg-white border border-gray-300 rounded px-1 text-center text-gray-900 w-20"
              autoFocus
            />
          ) : (
            <div
              className="text-xs font-medium text-gray-900 cursor-pointer hover:text-orange-700 bg-white bg-opacity-90 px-1 rounded"
              onDoubleClick={handleDoubleClick}
            >
              {label}
            </div>
          )}
          {data.description && (
            <div className="text-xs text-gray-600 mt-1 bg-white bg-opacity-80 px-1 rounded">
              {data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ManualOperationNode.displayName = 'ManualOperationNode'