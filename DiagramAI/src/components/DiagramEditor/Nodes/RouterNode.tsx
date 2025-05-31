'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface RouterNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const RouterNode = memo(({ data, selected, id }: NodeProps & { data: RouterNodeData }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || '')

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
      {/* Hexagonal router shape using SVG */}
      <svg
        width="100"
        height="90"
        viewBox="0 0 100 90"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Hexagon shape */}
        <path
          d="M25 15 L75 15 L90 45 L75 75 L25 75 L10 45 Z"
          fill="url(#routerGradient)"
          stroke={selected ? '#059669' : '#047857'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Router ports/connections */}
        <circle cx="30" cy="30" r="3" fill="#374151" />
        <circle cx="50" cy="25" r="3" fill="#374151" />
        <circle cx="70" cy="30" r="3" fill="#374151" />
        <circle cx="70" cy="60" r="3" fill="#374151" />
        <circle cx="50" cy="65" r="3" fill="#374151" />
        <circle cx="30" cy="60" r="3" fill="#374151" />
        
        {/* Status lights */}
        <circle cx="45" cy="40" r="2" fill="#10b981" />
        <circle cx="55" cy="40" r="2" fill="#10b981" />
        <circle cx="45" cy="50" r="2" fill="#f59e0b" />
        <circle cx="55" cy="50" r="2" fill="#10b981" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="routerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles positioned at hexagon vertices */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
        style={{ left: '35%', top: '15px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
        style={{ left: '65%', top: '15px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
        style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
        style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
        style={{ left: '35%', bottom: '15px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-emerald-500 border-2 border-white"
        style={{ left: '65%', bottom: '15px', transform: 'translateX(-50%)' }}
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
        <div className="text-center px-1 pointer-events-auto">
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

RouterNode.displayName = 'RouterNode'