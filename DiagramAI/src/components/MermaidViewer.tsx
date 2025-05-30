'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidViewerProps {
  content: string | { syntax?: string; mermaidSyntax?: string } | any
}

export default function MermaidViewer({ content }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Extract mermaid syntax from content
  const mermaidSyntax = React.useMemo(() => {
    console.log('MermaidViewer received content:', content, typeof content)

    if (typeof content === 'string') {
      return content
    }
    if (typeof content === 'object' && content) {
      return content.syntax || content.mermaidSyntax || content.content || ''
    }
    return ''
  }, [content])

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mermaidSyntax) {
      setIsLoading(false)
      return
    }

    const renderDiagram = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('Rendering Mermaid diagram:', { mermaidSyntax })

        // Wait for container to be available
        if (!containerRef.current) {
          console.warn('Container not ready, retrying...')
          setTimeout(renderDiagram, 100)
          return
        }

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
          sequence: {
            useMaxWidth: true,
            wrap: true,
          },
          gantt: {
            useMaxWidth: true,
          },
          journey: {
            useMaxWidth: true,
          },
          gitgraph: {
            useMaxWidth: true,
          },
        })

        // Double-check container exists before proceeding
        const container = containerRef.current
        if (!container) {
          throw new Error('Container element not found')
        }

        // Clear previous content
        container.innerHTML = ''

        // Create div with proper dimensions and visibility
        const mermaidDiv = document.createElement('div')
        mermaidDiv.className = 'mermaid'
        mermaidDiv.textContent = mermaidSyntax

        // Ensure the div has proper dimensions and is visible
        mermaidDiv.style.width = '100%'
        mermaidDiv.style.height = 'auto'
        mermaidDiv.style.minHeight = '200px'
        mermaidDiv.style.visibility = 'visible'
        mermaidDiv.style.display = 'block'

        container.appendChild(mermaidDiv)

        console.log('Created mermaid div with content:', mermaidSyntax)

        // Wait a moment for the DOM to settle
        await new Promise(resolve => setTimeout(resolve, 100))

        // Verify the element is properly attached and has dimensions
        const rect = mermaidDiv.getBoundingClientRect()
        console.log('Mermaid div dimensions:', rect.width, 'x', rect.height)

        if (rect.width === 0 || rect.height === 0) {
          console.warn('Mermaid div has zero dimensions, forcing size')
          mermaidDiv.style.width = '800px'
          mermaidDiv.style.height = '400px'
        }

        // Use mermaid.init() with the properly sized element
        try {
          await mermaid.init(undefined, mermaidDiv)
          console.log('Mermaid init completed successfully')

          // Add styling to the SVG
          const svgElement = mermaidDiv.querySelector('svg')
          if (svgElement) {
            svgElement.style.width = '100%'
            svgElement.style.height = 'auto'
            svgElement.style.maxWidth = '100%'
            svgElement.style.display = 'block'
            svgElement.style.margin = '0 auto'
            console.log('Applied SVG styling')
          } else {
            console.warn('No SVG element found after mermaid.init()')
          }
        } catch (initError) {
          console.error('mermaid.init() failed:', initError)
          throw initError
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      } finally {
        setIsLoading(false)
      }
    }

    // Add a longer delay to ensure the DOM is ready and avoid SSR issues
    const timeoutId = setTimeout(renderDiagram, 500)

    return () => clearTimeout(timeoutId)
  }, [isClient, mermaidSyntax])

  if (!mermaidSyntax) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">📝 No Mermaid content</p>
          <p className="text-gray-400 text-sm">This diagram appears to be empty</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Rendering diagram...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-lg mb-2">❌ Rendering Error</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <details className="text-left">
            <summary className="text-blue-600 cursor-pointer text-sm">View Mermaid Syntax</summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {mermaidSyntax}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {/* Viewer Controls */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(255,255,255,0.9)', borderRadius: '8px', padding: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
          <span>📝</span>
          <span>Mermaid View</span>
        </div>
      </div>

      {/* Syntax Display Toggle */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
        <details style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
          <summary style={{ padding: '8px', cursor: 'pointer', fontSize: '14px', color: '#666' }}>
            View Syntax
          </summary>
          <div style={{ position: 'absolute', right: '0', marginTop: '4px', width: '320px', maxWidth: '90vw', background: 'white', borderRadius: '8px', border: '1px solid #ddd', padding: '12px' }}>
            <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '160px', color: '#333', margin: 0 }}>
              {mermaidSyntax}
            </pre>
          </div>
        </details>
      </div>

      {/* Diagram Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          padding: '16px',
          overflow: 'auto',
          background: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
    </div>
  )
}
