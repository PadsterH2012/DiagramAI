'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface DocumentNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const DocumentNode = memo(({ data, selected, id }: NodeProps & { data: DocumentNodeData }) => {
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
      {/* Document shape using SVG path */}
      <svg
        width="140"
        height="100"
        viewBox="0 0 140 100"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Document shape with folded corner */}
        <path
          d="M10 10 L110 10 L110 20 L120 30 L120 90 L10 90 Z"
          fill="url(#documentGradient)"
          stroke={selected ? '#f97316' : '#d97706'}
          strokeWidth={selected ? 3 : 2}
        />
        {/* Folded corner */}
        <path
          d="M110 10 L110 20 L120 30"
          fill="none"
          stroke={selected ? '#f97316' : '#d97706'}
          strokeWidth={selected ? 3 : 2}
        />
        <path
          d="M110 20 L120 20 L120 30"
          fill="#f3e8ff"
          stroke={selected ? '#f97316' : '#d97706'}
          strokeWidth={1}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="documentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ left: '50%', top: '10px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ left: '50%', bottom: '10px', transform: 'translateX(-50%)' }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {data.icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mb-1 pointer-events-none"
            style={{ backgroundColor: data.color || '#f97316' }}
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
              className="text-xs font-medium bg-transparent border-none outline-none w-full text-center text-gray-900"
              autoFocus
              style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
            />
          ) : (
            <div
              className="text-xs font-medium text-gray-900 cursor-pointer hover:text-orange-700 px-1 rounded"
              onDoubleClick={handleDoubleClick}
              style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
            >
              {label}
            </div>
          )}
          {data.description && (
            <div className="text-xs text-gray-600 mt-1 px-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
              {data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

DocumentNode.displayName = 'DocumentNode'