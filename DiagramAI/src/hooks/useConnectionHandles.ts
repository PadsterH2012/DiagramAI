/**
 * Hook for generating dynamic connection handles metadata
 */

import { useMemo } from 'react'
import { NodeConnectionConfig, ConnectionHandle } from '../types/connection-config'
import { calculateInputPosition, calculateOutputPosition } from '../utils/handlePositioning'

export const useConnectionHandles = (config: NodeConnectionConfig) => {
  return useMemo(() => {
    const handles: ConnectionHandle[] = []
    
    // Generate input handles metadata
    for (let i = 0; i < config.inputs.count; i++) {
      const handlePos = calculateInputPosition(i, config.inputs.count)
      const label = config.inputs.labels[i] || `Input ${i + 1}`
      
      handles.push({
        id: `input-${i}`,
        type: 'target',
        position: handlePos,
        label
      })
    }
    
    // Generate output handles metadata  
    for (let i = 0; i < config.outputs.count; i++) {
      const handlePos = calculateOutputPosition(i, config.outputs.count)
      const label = config.outputs.labels[i] || `Output ${i + 1}`
      
      handles.push({
        id: `output-${i}`,
        type: 'source',
        position: handlePos,
        label
      })
    }
    
    return handles
  }, [config])
}

/**
 * Generate connection handle metadata for external use
 */
export const generateConnectionHandles = (config: NodeConnectionConfig): ConnectionHandle[] => {
  const handles: ConnectionHandle[] = []
  
  // Generate input handles metadata
  for (let i = 0; i < config.inputs.count; i++) {
    const handlePos = calculateInputPosition(i, config.inputs.count)
    const label = config.inputs.labels[i] || `Input ${i + 1}`
    
    handles.push({
      id: `input-${i}`,
      type: 'target',
      position: handlePos,
      label
    })
  }
  
  // Generate output handles metadata
  for (let i = 0; i < config.outputs.count; i++) {
    const handlePos = calculateOutputPosition(i, config.outputs.count)
    const label = config.outputs.labels[i] || `Output ${i + 1}`
    
    handles.push({
      id: `output-${i}`,
      type: 'source', 
      position: handlePos,
      label
    })
  }
  
  return handles
}