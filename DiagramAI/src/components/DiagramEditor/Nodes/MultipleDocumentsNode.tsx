'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface MultipleDocumentsNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const MultipleDocumentsNode = memo(({ data, selected, id }: NodeProps & { data: MultipleDocumentsNodeData }) => {
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
      {/* Multiple Documents shape using SVG */}
      <svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Back documents (stacked effect) */}
        <path
          d="M 25 15 L 85 15 L 85 70 Q 85 75 80 80 L 30 80 Q 25 75 25 70 Z"
          fill="#f3f4f6"
          stroke="#9ca3af"
          strokeWidth="1"
          opacity="0.7"
        />
        <path
          d="M 22 18 L 82 18 L 82 73 Q 82 78 77 83 L 27 83 Q 22 78 22 73 Z"
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth="1"
          opacity="0.8"
        />
        
        {/* Front document */}
        <path
          d="M 20 20 L 80 20 L 80 75 Q 80 80 75 85 L 25 85 Q 20 80 20 75 Z"
          fill="url(#multipleDocsGradient)"
          stroke={selected ? data.color || '#f97316' : '#ea580c'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Document lines */}
        <line x1="30" y1="35" x2="70" y2="35" stroke="#9ca3af" strokeWidth="1" />
        <line x1="30" y1="45" x2="65" y2="45" stroke="#9ca3af" strokeWidth="1" />
        <line x1="30" y1="55" x2="70" y2="55" stroke="#9ca3af" strokeWidth="1" />
        <line x1="30" y1="65" x2="60" y2="65" stroke="#9ca3af" strokeWidth="1" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="multipleDocsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
        style={{ left: '50%', top: '20px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
        style={{ right: '20px', top: '50%', transform: 'translateY(-50%)' }}
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
              className="text-xs font-medium bg-white border border-gray-300 rounded px-1 text-center text-gray-900 w-16"
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

MultipleDocumentsNode.displayName = 'MultipleDocumentsNode'