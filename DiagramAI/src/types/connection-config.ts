/**
 * Connection Configuration Types for Compact Node Properties
 * Provides interfaces for dynamic input/output configuration
 */

import { Position } from '@xyflow/react'

export interface NodeConnectionConfig {
  inputs: {
    count: number // 1-6
    labels: string[] // Custom labels for each input
  }
  outputs: {
    count: number // 1-6  
    labels: string[] // Custom labels for each output
  }
}

export interface HandlePosition {
  position: Position
  offset?: string // Percentage offset for multiple handles on same edge
}

export interface ConnectionHandle {
  id: string
  type: 'source' | 'target'
  position: HandlePosition
  label: string
}

// Default configurations for different node types
export const DEFAULT_CONNECTIONS: Record<string, NodeConnectionConfig> = {
  // Basic process symbols
  process: {
    inputs: { count: 1, labels: ['Input'] },
    outputs: { count: 1, labels: ['Output'] }
  },
  decision: {
    inputs: { count: 1, labels: ['Condition'] },
    outputs: { count: 2, labels: ['Yes', 'No'] }
  },
  'start-end': {
    inputs: { count: 1, labels: ['Flow'] },
    outputs: { count: 1, labels: ['Flow'] }
  },
  
  // Data symbols
  database: {
    inputs: { count: 2, labels: ['Query', 'Data'] },
    outputs: { count: 2, labels: ['Result', 'Error'] }
  },
  document: {
    inputs: { count: 1, labels: ['Content'] },
    outputs: { count: 1, labels: ['Document'] }
  },
  
  // Advanced symbols
  cloud: {
    inputs: { count: 2, labels: ['Request', 'Data'] },
    outputs: { count: 2, labels: ['Response', 'Error'] }
  },
  connector: {
    inputs: { count: 1, labels: ['Input'] },
    outputs: { count: 1, labels: ['Output'] }
  }
}

/**
 * Get default connection configuration for a node type
 */
export const getDefaultConnections = (symbolType: string): NodeConnectionConfig => {
  return DEFAULT_CONNECTIONS[symbolType] || DEFAULT_CONNECTIONS.process
}

/**
 * Enhanced node data interface with connection configuration
 */
export interface EnhancedNodeData {
  label: string
  description?: string
  color?: string
  backgroundColor?: string
  icon?: string
  connections?: NodeConnectionConfig
  symbolType?: string
}