'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues
const ReactFlowViewer = dynamic(() => import('./ReactFlowViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
      <div className="text-xs text-gray-400">Loading...</div>
    </div>
  )
})

const MermaidViewerFixed = dynamic(() => import('./MermaidViewerFixed'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
      <div className="text-xs text-gray-400">Loading...</div>
    </div>
  )
})

interface DiagramThumbnailProps {
  content: any
  format: 'reactflow' | 'mermaid'
  title: string
  width?: number
  height?: number
  onClick?: () => void
  className?: string
}

// Component to render blank diagram placeholder
const BlankDiagramPlaceholder: React.FC<{ format: string; title: string }> = ({ format, title }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded">
    <div className="text-2xl text-gray-300 mb-1">
      {format === 'reactflow' ? '🎨' : '📝'}
    </div>
    <div className="text-xs text-gray-400 text-center px-2">
      Empty {format === 'reactflow' ? 'Visual' : 'Mermaid'} Diagram
    </div>
  </div>
)

// Check if diagram content is empty or blank
const isBlankDiagram = (content: any, format: string): boolean => {
  if (!content) return true
  
  try {
    if (format === 'reactflow') {
      const nodes = content.nodes || []
      const edges = content.edges || []
      return nodes.length === 0 && edges.length === 0
    }
    
    if (format === 'mermaid') {
      const syntax = content.syntax || content.code || content.value || ''
      return !syntax || syntax.trim().length === 0
    }
  } catch (error) {
    console.warn('Error checking diagram content:', error)
    return true
  }
  
  return true
}

export default function DiagramThumbnail({ 
  content, 
  format, 
  title,
  width = 200, 
  height = 150, 
  onClick,
  className = ""
}: DiagramThumbnailProps) {
  
  // Check if diagram is blank
  if (isBlankDiagram(content, format)) {
    return (
      <div 
        className={`relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer ${className}`}
        style={{ width, height }}
        onClick={onClick}
      >
        <BlankDiagramPlaceholder format={format} title={title} />
      </div>
    )
  }

  return (
    <div 
      className={`relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer ${className}`}
      style={{ width, height }}
      onClick={onClick}
    >
      {/* Thumbnail overlay to prevent interaction */}
      <div className="absolute inset-0 z-10 bg-transparent" />
      
      {/* Diagram preview */}
      <div className="w-full h-full transform scale-75 origin-top-left">
        <div style={{ width: width / 0.75, height: height / 0.75 }}>
          {format === 'reactflow' ? (
            <ReactFlowViewer content={content} />
          ) : format === 'mermaid' ? (
            <MermaidViewerFixed content={content} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-xs text-gray-500">Unsupported format: {format}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Format indicator */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {format === 'reactflow' ? '🎨' : '📝'}
      </div>
    </div>
  )
}