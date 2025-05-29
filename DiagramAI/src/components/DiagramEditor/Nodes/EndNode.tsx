'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface EndNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const EndNode = memo<NodeProps<EndNodeData>>(({ data, selected }) => {
  return (
    <div className={`
      px-4 py-2 shadow-md rounded-full bg-red-50 border-2 min-w-[120px]
      ${selected ? 'border-red-500' : 'border-red-300'}
      hover:shadow-lg transition-shadow
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-red-500"
      />
      
      <div className="flex items-center justify-center space-x-2">
        {data.icon && (
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-lg">{data.icon}</span>
          </div>
        )}
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-500 mt-1">
              {data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

EndNode.displayName = 'EndNode'
