'use client'

import React, { memo } from 'react'
import { NodeProps } from '@xyflow/react'
import { useConnectionHandles } from '../../../hooks/useConnectionHandles'
import { EnhancedNodeData, getDefaultConnections } from '../../../types/connection-config'
import { renderConnectionHandles } from '../../../utils/handleRendering'

export const EnhancedProcessNode = memo(({ data, selected }: NodeProps & { data: EnhancedNodeData }) => {
  // Get connection configuration or use defaults
  const connections = data.connections || getDefaultConnections('process')
  const handleData = useConnectionHandles(connections)

  return (
    <div className={`
      relative px-4 py-3 shadow-md bg-white border-2 rounded-md min-w-[120px] min-h-[60px]
      ${selected ? 'border-blue-500' : 'border-blue-300'}
      hover:shadow-lg transition-shadow
    `}
    style={{ 
      backgroundColor: data.backgroundColor || '#ffffff',
      borderColor: selected ? data.color || '#3b82f6' : '#d1d5db'
    }}>
      {/* Dynamic Handles */}
      {renderConnectionHandles(handleData)}
      
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          {data.icon && (
            <div 
              className="w-6 h-6 rounded flex items-center justify-center mx-auto mb-1 text-white text-sm font-medium"
              style={{ backgroundColor: data.color || '#3b82f6' }}
            >
              <span className="text-xs">{data.icon}</span>
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

EnhancedProcessNode.displayName = 'EnhancedProcessNode'