'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface ProcessNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const ProcessNode = memo<NodeProps<ProcessNodeData>>(({ data, selected }) => {
  return (
    <div className={`
      px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[150px]
      ${selected ? 'border-blue-500' : 'border-gray-300'}
      hover:shadow-lg transition-shadow
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />
      
      <div className="flex items-center space-x-2">
        {data.icon && (
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-lg">{data.icon}</span>
          </div>
        )}
        <div className="flex-1">
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
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  )
})

ProcessNode.displayName = 'ProcessNode'
