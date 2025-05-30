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

        // Create div with explicit dimensions (this is the key!)
        const mermaidDiv = document.createElement('div')
        mermaidDiv.className = 'mermaid'
        mermaidDiv.textContent = mermaidSyntax

        // Force explicit dimensions and ensure they're applied
        mermaidDiv.style.cssText = `
          width: 800px !important;
          height: 400px !important;
          max-width: 100% !important;
          visibility: visible !important;
          display: block !important;
          position: relative !important;
          background: rgba(255,0,0,0.1) !important;
          border: 2px solid red !important;
        `

        container.appendChild(mermaidDiv)

        console.log('Created mermaid div with content:', mermaidSyntax)

        // Force multiple reflows to ensure styles are applied
        mermaidDiv.offsetHeight
        container.offsetHeight

        // Wait longer for DOM to settle
        await new Promise(resolve => setTimeout(resolve, 300))

        // Verify the element is properly attached and has dimensions
        const rect = mermaidDiv.getBoundingClientRect()
        console.log('Mermaid div dimensions:', rect.width, 'x', rect.height)
        console.log('Mermaid div computed style width:', window.getComputedStyle(mermaidDiv).width)
        console.log('Mermaid div computed style height:', window.getComputedStyle(mermaidDiv).height)

        // Also check the container dimensions and parent chain
        const containerRect = container.getBoundingClientRect()
        console.log('Container dimensions:', containerRect.width, 'x', containerRect.height)
        console.log('Container computed style:', window.getComputedStyle(container).width, 'x', window.getComputedStyle(container).height)

        // Check parent chain
        let parent = container.parentElement
        let level = 0
        while (parent && level < 5) {
          const parentRect = parent.getBoundingClientRect()
          const parentStyle = window.getComputedStyle(parent)
          console.log(`Parent ${level}:`, parentRect.width, 'x', parentRect.height, 'display:', parentStyle.display, 'position:', parentStyle.position)
          parent = parent.parentElement
          level++
        }

        if (rect.width === 0 || rect.height === 0) {
          console.error('CRITICAL: Mermaid div STILL has zero dimensions after forcing!')
          console.log('Element parent:', mermaidDiv.parentElement)
          console.log('Element in DOM:', document.contains(mermaidDiv))
          throw new Error('Cannot render Mermaid: element has zero dimensions')
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
    <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: '400px' }}>
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
          minHeight: '400px',
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
