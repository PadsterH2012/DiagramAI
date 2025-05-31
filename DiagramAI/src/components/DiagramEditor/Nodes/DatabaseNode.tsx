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
    <div className="relative">
      {/* Database cylinder shape using SVG */}
      <svg
        width="100"
        height="120"
        viewBox="0 0 100 120"
        className={`
          shadow-md
          ${selected ? 'filter drop-shadow-lg' : ''}
          hover:filter hover:drop-shadow-lg transition-all duration-200
        `}
      >
        {/* Cylinder body */}
        <rect
          x="20"
          y="20"
          width="60"
          height="80"
          fill="url(#databaseGradient)"
          stroke={selected ? '#84cc16' : '#65a30d'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Top ellipse */}
        <ellipse
          cx="50"
          cy="20"
          rx="30"
          ry="8"
          fill="#bbf7d0"
          stroke={selected ? '#84cc16' : '#65a30d'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Bottom ellipse */}
        <ellipse
          cx="50"
          cy="100"
          rx="30"
          ry="8"
          fill="#bbf7d0"
          stroke={selected ? '#84cc16' : '#65a30d'}
          strokeWidth={selected ? 3 : 2}
        />
        
        {/* Database disks */}
        <ellipse cx="50" cy="35" rx="25" ry="3" fill="#16a34a" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="25" ry="3" fill="#16a34a" opacity="0.3" />
        <ellipse cx="50" cy="65" rx="25" ry="3" fill="#16a34a" opacity="0.3" />
        <ellipse cx="50" cy="80" rx="25" ry="3" fill="#16a34a" opacity="0.3" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="databaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ left: '50%', top: '12px', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ right: '20px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        style={{ left: '50%', bottom: '12px', transform: 'translateX(-50%)' }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {data.icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mb-1"
            style={{ backgroundColor: data.color || '#84cc16' }}
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
              className="text-xs font-medium text-gray-900 cursor-pointer hover:text-green-700 bg-white bg-opacity-90 px-1 rounded"
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

DatabaseNode.displayName = 'DatabaseNode'
