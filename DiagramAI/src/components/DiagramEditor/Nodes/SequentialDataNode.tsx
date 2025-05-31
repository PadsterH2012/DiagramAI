'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface SequentialDataNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const SequentialDataNode = memo(({ data, selected, id }: NodeProps & { data: SequentialDataNodeData }) => {
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
      {/* Sequential Data symbol (tape/reel shape) using SVG */}
      <svg
        width="140"
        height="80"
        viewBox="0 0 140 80"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Sequential data shape - oval with connecting rectangle */}
        <ellipse
          cx="35"
          cy="40"
          rx="15"
          ry="20"
          fill="url(#sequentialGradient)"
          stroke={selected ? data.color || '#1e40af' : '#2563eb'}
          strokeWidth={selected ? 3 : 2}
        />
        
        <rect
          x="35"
          y="25"
          width="70"
          height="30"
          fill="url(#sequentialGradient)"
          stroke={selected ? data.color || '#1e40af' : '#2563eb'}
          strokeWidth={selected ? 3 : 2}
        />
        
        <ellipse
          cx="105"
          cy="40"
          rx="15"
          ry="20"
          fill="url(#sequentialGradient)"
          stroke={selected ? data.color || '#1e40af' : '#2563eb'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Sequential indicators (lines across the tape) */}
        <line x1="45" y1="30" x2="45" y2="50" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
        <line x1="55" y1="30" x2="55" y2="50" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
        <line x1="65" y1="30" x2="65" y2="50" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
        <line x1="75" y1="30" x2="75" y2="50" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
        <line x1="85" y1="30" x2="85" y2="50" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
        <line x1="95" y1="30" x2="95" y2="50" stroke="#1e40af" strokeWidth="1" opacity="0.5" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="sequentialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-600 border-2 border-white"
        style={{ left: '50%', top: '25px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-600 border-2 border-white"
        style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-600 border-2 border-white"
        style={{ right: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-600 border-2 border-white"
        style={{ left: '50%', bottom: '25px', transform: 'translateX(-50%)' }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {data.icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mb-1"
            style={{ backgroundColor: data.color || '#1e40af' }}
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
              className="text-xs font-medium text-gray-900 cursor-pointer hover:text-blue-700 bg-white bg-opacity-90 px-1 rounded"
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

SequentialDataNode.displayName = 'SequentialDataNode'