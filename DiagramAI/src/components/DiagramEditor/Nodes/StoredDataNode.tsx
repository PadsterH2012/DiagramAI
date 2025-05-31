'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface StoredDataNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const StoredDataNode = memo(({ data, selected, id }: NodeProps & { data: StoredDataNodeData }) => {
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
      {/* Stored Data symbol (curved rectangle) using SVG */}
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
        {/* Stored data shape - rectangle with curved left side */}
        <path
          d="M 30 20 Q 20 20 20 30 L 20 50 Q 20 60 30 60 L 90 60 L 90 20 Z"
          fill="url(#storedDataGradient)"
          stroke={selected ? data.color || '#059669' : '#047857'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Data representation lines */}
        <line x1="35" y1="30" x2="80" y2="30" stroke="#065f46" strokeWidth="1" opacity="0.6" />
        <line x1="35" y1="38" x2="75" y2="38" stroke="#065f46" strokeWidth="1" opacity="0.6" />
        <line x1="35" y1="46" x2="80" y2="46" stroke="#065f46" strokeWidth="1" opacity="0.6" />
        <line x1="35" y1="54" x2="70" y2="54" stroke="#065f46" strokeWidth="1" opacity="0.6" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="storedDataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-emerald-600 border-2 border-white"
        style={{ left: '50%', top: '20px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-emerald-600 border-2 border-white"
        style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-emerald-600 border-2 border-white"
        style={{ right: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-emerald-600 border-2 border-white"
        style={{ left: '50%', bottom: '20px', transform: 'translateX(-50%)' }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {data.icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mb-1"
            style={{ backgroundColor: data.color || '#059669' }}
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
              className="text-xs font-medium text-gray-900 cursor-pointer hover:text-emerald-700 bg-white bg-opacity-90 px-1 rounded"
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

StoredDataNode.displayName = 'StoredDataNode'