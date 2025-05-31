'use client'

import React, { memo } from 'react'
import { NodeProps } from '@xyflow/react'
import { useConnectionHandles } from '../../../hooks/useConnectionHandles'
import { EnhancedNodeData, getDefaultConnections } from '../../../types/connection-config'
import { renderConnectionHandles } from '../../../utils/handleRendering'

export const EnhancedDecisionNode = memo(({ data, selected }: NodeProps & { data: EnhancedNodeData }) => {
  // Get connection configuration or use defaults
  const connections = data.connections || getDefaultConnections('decision')
  const handleData = useConnectionHandles(connections)

  return (
    <div className={`
      relative px-4 py-2 shadow-md bg-yellow-50 border-2 min-w-[150px]
      ${selected ? 'border-yellow-500' : 'border-yellow-300'}
      hover:shadow-lg transition-shadow
      transform rotate-45 origin-center
    `}>
      {/* Dynamic Handles */}
      {renderConnectionHandles(handleData)}
      
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
    </div>
  )
})

EnhancedDecisionNode.displayName = 'EnhancedDecisionNode'