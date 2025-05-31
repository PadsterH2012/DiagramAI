'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface InternalStorageNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const InternalStorageNode = memo(({ data, selected, id }: NodeProps & { data: InternalStorageNodeData }) => {
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
      {/* Internal Storage symbol (rectangle with internal lines) using SVG */}
      <svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Main rectangle */}
        <rect
          x="20"
          y="20"
          width="80"
          height="40"
          fill="url(#internalStorageGradient)"
          stroke={selected ? data.color || '#7c2d12' : '#a16207'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Internal division lines */}
        <line
          x1="20"
          y1="35"
          x2="100"
          y2="35"
          stroke={selected ? data.color || '#7c2d12' : '#a16207'}
          strokeWidth="1.5"
        />
        <line
          x1="35"
          y1="20"
          x2="35"
          y2="60"
          stroke={selected ? data.color || '#7c2d12' : '#a16207'}
          strokeWidth="1.5"
        />
        
        {/* Storage cells indication */}
        <rect x="25" y="25" width="6" height="6" fill="#92400e" opacity="0.6" />
        <rect x="40" y="25" width="6" height="6" fill="#92400e" opacity="0.6" />
        <rect x="55" y="25" width="6" height="6" fill="#92400e" opacity="0.6" />
        <rect x="25" y="40" width="6" height="6" fill="#92400e" opacity="0.6" />
        <rect x="40" y="40" width="6" height="6" fill="#92400e" opacity="0.6" />
        <rect x="55" y="40" width="6" height="6" fill="#92400e" opacity="0.6" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="internalStorageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-amber-600 border-2 border-white"
        style={{ left: '50%', top: '20px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-amber-600 border-2 border-white"
        style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-amber-600 border-2 border-white"
        style={{ right: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-amber-600 border-2 border-white"
        style={{ left: '50%', bottom: '20px', transform: 'translateX(-50%)' }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {data.icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mb-1"
            style={{ backgroundColor: data.color || '#7c2d12' }}
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
              className="text-xs font-medium bg-white border border-gray-300 rounded px-1 text-center text-gray-900 w-16"
              autoFocus
            />
          ) : (
            <div
              className="text-xs font-medium text-gray-900 cursor-pointer hover:text-amber-700 bg-white bg-opacity-90 px-1 rounded"
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

InternalStorageNode.displayName = 'InternalStorageNode'