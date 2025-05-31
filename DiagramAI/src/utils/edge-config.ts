/**
 * Enhanced Edge Configuration System for DiagramAI
 * Provides advanced connection types and styling options
 */

// Edge types and configurations
export const edgeTypes = {
  default: {
    type: 'default',
    pathOptions: { borderRadius: 0 },
    style: { strokeWidth: 2, stroke: '#374151' },
    markerEnd: { type: 'arrowclosed', color: '#374151' }
  },
  straight: {
    type: 'straight',
    pathOptions: {},
    style: { strokeWidth: 2, stroke: '#374151' },
    markerEnd: { type: 'arrowclosed', color: '#374151' }
  },
  smoothstep: {
    type: 'smoothstep',
    pathOptions: { borderRadius: 20 },
    style: { strokeWidth: 2, stroke: '#374151' },
    markerEnd: { type: 'arrowclosed', color: '#374151' }
  },
  step: {
    type: 'step',
    pathOptions: {},
    style: { strokeWidth: 2, stroke: '#374151' },
    markerEnd: { type: 'arrowclosed', color: '#374151' }
  },
  bezier: {
    type: 'default', // React Flow's default is bezier
    pathOptions: {},
    style: { strokeWidth: 2, stroke: '#374151' },
    markerEnd: { type: 'arrowclosed', color: '#374151' }
  }
}

// Arrow marker configurations
export const arrowMarkers = {
  none: null,
  arrow: { type: 'arrowclosed' },
  arrowOpen: { type: 'arrow' },
  diamond: { 
    type: 'custom',
    width: 12,
    height: 12,
    path: 'M6,0 L12,6 L6,12 L0,6 Z'
  },
  circle: {
    type: 'custom', 
    width: 10,
    height: 10,
    path: 'M5,0 A5,5 0 1,1 5,10 A5,5 0 1,1 5,0 Z'
  },
  square: {
    type: 'custom',
    width: 10,
    height: 10,
    path: 'M0,0 L10,0 L10,10 L0,10 Z'
  },
  cross: {
    type: 'custom',
    width: 12,
    height: 12,
    path: 'M2,2 L10,10 M10,2 L2,10'
  }
}

// Line styles
export const lineStyles = {
  solid: {},
  dashed: { strokeDasharray: '5,5' },
  dotted: { strokeDasharray: '2,2' },
  dashdot: { strokeDasharray: '8,3,2,3' }
}

// Connection styling presets
export const connectionPresets = {
  default: {
    strokeWidth: 2,
    stroke: '#374151',
    strokeDasharray: undefined,
    animated: false,
    markerEnd: arrowMarkers.arrow
  },
  success: {
    strokeWidth: 2,
    stroke: '#10b981',
    strokeDasharray: undefined,
    animated: false,
    markerEnd: { ...arrowMarkers.arrow, color: '#10b981' }
  },
  error: {
    strokeWidth: 2,
    stroke: '#ef4444',
    strokeDasharray: undefined,
    animated: false,
    markerEnd: { ...arrowMarkers.arrow, color: '#ef4444' }
  },
  warning: {
    strokeWidth: 2,
    stroke: '#f59e0b',
    strokeDasharray: undefined,
    animated: false,
    markerEnd: { ...arrowMarkers.arrow, color: '#f59e0b' }
  },
  info: {
    strokeWidth: 2,
    stroke: '#3b82f6',
    strokeDasharray: undefined,
    animated: false,
    markerEnd: { ...arrowMarkers.arrow, color: '#3b82f6' }
  },
  dashed: {
    strokeWidth: 2,
    stroke: '#6b7280',
    strokeDasharray: '5,5',
    animated: false,
    markerEnd: { ...arrowMarkers.arrow, color: '#6b7280' }
  },
  animated: {
    strokeWidth: 2,
    stroke: '#8b5cf6',
    strokeDasharray: undefined,
    animated: true,
    markerEnd: { ...arrowMarkers.arrow, color: '#8b5cf6' }
  },
  thick: {
    strokeWidth: 4,
    stroke: '#374151',
    strokeDasharray: undefined,
    animated: false,
    markerEnd: { ...arrowMarkers.arrow, color: '#374151' }
  },
  thin: {
    strokeWidth: 1,
    stroke: '#9ca3af',
    strokeDasharray: undefined,
    animated: false,
    markerEnd: { ...arrowMarkers.arrow, color: '#9ca3af' }
  }
}

// Helper function to create edge with styling
export function createStyledEdge(
  id: string,
  source: string,
  target: string,
  preset: keyof typeof connectionPresets = 'default',
  options: {
    type?: keyof typeof edgeTypes
    label?: string
    customStyle?: Record<string, any>
  } = {}
) {
  const edgeType = edgeTypes[options.type || 'default']
  const stylePreset = connectionPresets[preset]
  
  return {
    id,
    source,
    target,
    type: edgeType.type,
    style: {
      ...edgeType.style,
      ...stylePreset,
      ...options.customStyle
    },
    markerEnd: stylePreset.markerEnd,
    animated: stylePreset.animated,
    label: options.label,
    ...(edgeType.pathOptions && { pathOptions: edgeType.pathOptions })
  }
}

// Enhanced edge interface
export interface EnhancedEdge {
  id: string
  source: string
  target: string
  type?: string
  style?: {
    strokeWidth?: number
    stroke?: string
    strokeDasharray?: string
  }
  markerEnd?: any
  markerStart?: any
  animated?: boolean
  label?: string
  labelStyle?: {
    fill?: string
    fontSize?: number
    fontWeight?: string
  }
  pathOptions?: {
    borderRadius?: number
    curvature?: number
  }
  data?: {
    preset?: keyof typeof connectionPresets
    description?: string
    [key: string]: any
  }
}