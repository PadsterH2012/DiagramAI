'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface DecisionNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
}

export const DecisionNode = memo<NodeProps<DecisionNodeData>>(({ data, selected }) => {
  return (
    <div className={`
      relative px-4 py-2 shadow-md bg-yellow-50 border-2 min-w-[150px]
      ${selected ? 'border-yellow-500' : 'border-yellow-300'}
      hover:shadow-lg transition-shadow
      transform rotate-45 origin-center
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-yellow-500 -translate-y-2"
      />
      
      <div className="transform -rotate-45 flex items-center justify-center">
        <div className="text-center">
          {data.icon && (
            <div className="w-6 h-6 flex items-center justify-center mx-auto mb-1">
              <span className="text-lg">{data.icon}</span>
            </div>
          )}
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
        className="w-3 h-3 !bg-yellow-500 translate-y-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-yellow-500 translate-x-2"
      />
    </div>
  )
})

DecisionNode.displayName = 'DecisionNode'
