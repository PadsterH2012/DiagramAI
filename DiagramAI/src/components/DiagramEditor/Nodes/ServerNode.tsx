'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface ServerNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const ServerNode = memo(({ data, selected, id }: NodeProps & { data: ServerNodeData }) => {
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
      {/* Server rack shape using SVG */}
      <svg
        width="80"
        height="120"
        viewBox="0 0 80 120"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Server rack body */}
        <rect
          x="10"
          y="10"
          width="60"
          height="100"
          rx="4"
          fill="url(#serverGradient)"
          stroke={selected ? '#6366f1' : '#4f46e5'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Server rack segments */}
        <line x1="15" y1="25" x2="65" y2="25" stroke="#374151" strokeWidth="1" />
        <line x1="15" y1="40" x2="65" y2="40" stroke="#374151" strokeWidth="1" />
        <line x1="15" y1="55" x2="65" y2="55" stroke="#374151" strokeWidth="1" />
        <line x1="15" y1="70" x2="65" y2="70" stroke="#374151" strokeWidth="1" />
        <line x1="15" y1="85" x2="65" y2="85" stroke="#374151" strokeWidth="1" />
        
        {/* Status lights */}
        <circle cx="20" cy="17" r="2" fill="#10b981" />
        <circle cx="26" cy="17" r="2" fill="#10b981" />
        <circle cx="32" cy="17" r="2" fill="#f59e0b" />
        
        <circle cx="20" cy="32" r="2" fill="#10b981" />
        <circle cx="26" cy="32" r="2" fill="#10b981" />
        <circle cx="32" cy="32" r="2" fill="#10b981" />
        
        <circle cx="20" cy="47" r="2" fill="#10b981" />
        <circle cx="26" cy="47" r="2" fill="#ef4444" />
        <circle cx="32" cy="47" r="2" fill="#6b7280" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="serverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-indigo-500 border-2 border-white"
        style={{ left: '50%', top: '10px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-indigo-500 border-2 border-white"
        style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-indigo-500 border-2 border-white"
        style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-indigo-500 border-2 border-white"
        style={{ left: '50%', bottom: '10px', transform: 'translateX(-50%)' }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none pb-2">
        {data.icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mb-1"
            style={{ backgroundColor: data.color || '#6366f1' }}
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
              className="text-xs font-medium text-gray-900 cursor-pointer hover:text-indigo-700 bg-white bg-opacity-90 px-1 rounded border"
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

ServerNode.displayName = 'ServerNode'