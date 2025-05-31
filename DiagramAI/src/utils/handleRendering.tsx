/**
 * Utility functions for rendering connection handles
 */

import React from 'react'
import { Handle } from '@xyflow/react'
import { ConnectionHandle } from '../types/connection-config'
import { getHandleStyle } from './handlePositioning'

/**
 * Render connection handles from metadata
 */
export const renderConnectionHandles = (handles: ConnectionHandle[]): JSX.Element[] => {
  return handles.map((handleData) => (
    <Handle
      key={handleData.id}
      type={handleData.type}
      position={handleData.position.position}
      id={handleData.id}
      title={handleData.label}
      style={getHandleStyle(handleData.position, handleData.type === 'source')}
    />
  ))
}