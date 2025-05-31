/**
 * Enhanced Node Definition System for DiagramAI
 * Provides comprehensive node configuration inspired by Lucidchart
 */

// Base interfaces for styling and configuration
export interface NodeStyling {
  // Colors
  backgroundColor: string
  borderColor: string
  textColor: string
  gradientColors?: [string, string]
  
  // Border & Shape
  borderWidth: number
  borderStyle: 'solid' | 'dashed' | 'dotted'
  borderRadius: number
  
  // Effects
  shadow: {
    enabled: boolean
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
  
  // Typography
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  textAlign: 'left' | 'center' | 'right'
  
  // Icon
  icon?: {
    name: string
    size: number
    color: string
    position: 'top' | 'left' | 'right' | 'bottom'
  }
}

export interface HandleConfig {
  id: string
  type: 'source' | 'target' | 'both'
  position: 'top' | 'bottom' | 'left' | 'right'
  style: {
    backgroundColor: string
    borderColor: string
    size: number
    shape: 'circle' | 'square' | 'diamond'
  }
  connectionRules?: {
    allowedTargets?: string[] // Node types this can connect to
    maxConnections?: number
    requiresLabel?: boolean
  }
}

export interface NodeDefinition {
  id: string
  type: string
  category: string
  name: string
  description?: string
  icon?: string
  
  // Visual properties
  defaultSize: { width: number; height: number }
  minSize?: { width: number; height: number }
  maxSize?: { width: number; height: number }
  aspectRatio?: number
  
  // Behavior
  resizable: boolean
  rotatable: boolean
  deletable: boolean
  
  // Connections
  handles: HandleConfig[]
  
  // Styling
  defaultStyle: NodeStyling
  styleVariants?: NodeStyling[]
  
  // Custom properties
  customProperties?: Record<string, any>
  
  // Metadata
  tags: string[]
  version: string
  author?: string
}

// Connection and Edge Types
export interface ConnectionStyling {
  strokeWidth: number
  strokeColor: string
  strokeDasharray?: string // For dashed/dotted lines
  
  // Animation
  animated: boolean
  animationSpeed?: number
  
  // Labels
  label?: {
    text: string
    position: number // 0-1 along the path
    backgroundColor?: string
    borderColor?: string
    fontSize: number
  }
  
  // Routing
  routing: {
    type: 'straight' | 'orthogonal' | 'curved' | 'smoothstep'
    avoidNodes: boolean
    cornerRadius?: number
  }
}

export interface ArrowConfig {
  startMarker?: {
    type: 'arrow' | 'diamond' | 'circle' | 'square' | 'cross'
    size: 'small' | 'medium' | 'large'
    filled?: boolean
  }
  endMarker?: {
    type: 'arrow' | 'diamond' | 'circle' | 'square' | 'cross'
    size: 'small' | 'medium' | 'large'
    filled?: boolean
  }
}

// Shape-specific interfaces
export interface FlowchartNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
  shape: 'rectangle' | 'diamond' | 'oval' | 'circle' | 'document' | 'cylinder'
}

export interface BPMNNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
  bpmnType: 'task' | 'gateway' | 'event' | 'swimlane'
  variant?: string
}

export interface NetworkNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
  networkType: 'server' | 'router' | 'switch' | 'cloud' | 'database' | 'firewall'
  variant?: string
}

export interface UMLNodeData {
  label: string
  description?: string
  color?: string
  icon?: string
  umlType: 'class' | 'actor' | 'usecase' | 'component' | 'package'
  sections?: string[]
}

// Enhanced node category definitions
export interface NodeCategory {
  id: string
  name: string
  icon: string
  description?: string
  nodes: NodeDefinition[]
  collapsed?: boolean
  order?: number
}

// Node registry interface
export interface NodeRegistry {
  register(type: string, definition: NodeDefinition): void
  get(type: string): NodeDefinition | undefined
  getByCategory(category: string): NodeDefinition[]
  search(query: string): NodeDefinition[]
  getCategories(): NodeCategory[]
}

// Theme system
export interface NodeTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    border: string
  }
  typography: {
    fontFamily: string
    fontSize: number
    fontWeight: string
  }
  effects: {
    shadowEnabled: boolean
    borderRadius: number
    borderWidth: number
  }
}