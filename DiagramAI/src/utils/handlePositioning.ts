/**
 * Handle Positioning Utilities
 * Calculates intelligent positioning for connection handles based on count
 */

import { Position } from '@xyflow/react'
import { HandlePosition } from '../types/connection-config'

/**
 * Calculate input handle positions based on count
 */
export const calculateInputPosition = (index: number, total: number): HandlePosition => {
  if (total === 1) {
    return { position: Position.Left }
  }
  
  // Distribute evenly along left edge
  const spacing = 1 / (total + 1)
  const offset = spacing * (index + 1)
  
  return {
    position: Position.Left,
    offset: `${offset * 100}%`
  }
}

/**
 * Calculate output handle positions based on count
 */
export const calculateOutputPosition = (index: number, total: number): HandlePosition => {
  if (total === 1) {
    return { position: Position.Right }
  }
  
  if (total === 2) {
    return index === 0 ? { position: Position.Bottom } : { position: Position.Right }
  }
  
  // For 3+ outputs, distribute across bottom and right edges
  if (total <= 4) {
    // Use bottom for first half, right for second half
    const halfCount = Math.ceil(total / 2)
    
    if (index < halfCount) {
      // Bottom edge
      const spacing = 1 / (halfCount + 1)
      const offset = spacing * (index + 1)
      return {
        position: Position.Bottom,
        offset: `${offset * 100}%`
      }
    } else {
      // Right edge
      const rightIndex = index - halfCount
      const rightCount = total - halfCount
      const spacing = 1 / (rightCount + 1)
      const offset = spacing * (rightIndex + 1)
      return {
        position: Position.Right,
        offset: `${offset * 100}%`
      }
    }
  }
  
  // For 5-6 outputs, use all edges except top
  const edgeAssignment = [
    Position.Bottom,
    Position.Bottom,
    Position.Right,
    Position.Right,
    Position.Left,
    Position.Left
  ]
  
  const position = edgeAssignment[index] || Position.Right
  
  // Calculate offset within the edge
  const sameEdgeIndices = edgeAssignment
    .map((edge, i) => edge === position ? i : -1)
    .filter(i => i !== -1)
  
  const edgeIndex = sameEdgeIndices.indexOf(index)
  const edgeCount = sameEdgeIndices.length
  
  if (edgeCount === 1) {
    return { position }
  }
  
  const spacing = 1 / (edgeCount + 1)
  const offset = spacing * (edgeIndex + 1)
  
  return {
    position,
    offset: `${offset * 100}%`
  }
}

/**
 * Convert handle position to React Flow style properties
 */
export const getHandleStyle = (handlePos: HandlePosition, isSource: boolean = false) => {
  const baseStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
    backgroundColor: isSource ? '#3b82f6' : '#10b981'
  }
  
  if (!handlePos.offset) {
    return baseStyle
  }
  
  switch (handlePos.position) {
    case Position.Top:
    case Position.Bottom:
      return {
        ...baseStyle,
        left: handlePos.offset,
        transform: 'translateX(-50%)'
      }
    case Position.Left:
    case Position.Right:
      return {
        ...baseStyle,
        top: handlePos.offset,
        transform: 'translateY(-50%)'
      }
    default:
      return baseStyle
  }
}