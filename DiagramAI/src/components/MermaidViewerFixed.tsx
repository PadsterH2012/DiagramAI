'use client'

import React, { useEffect, useRef, useState } from 'react'
import MermaidService from '@/services/MermaidService'

interface MermaidViewerProps {
  content: string | { syntax?: string; mermaidSyntax?: string } | any
}

export default function MermaidViewerFixed({ content }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryTrigger, setRetryTrigger] = useState(0)

  // Extract mermaid syntax from content
  const mermaidSyntax = React.useMemo(() => {
    console.log('🔧 FIXED: MermaidViewer received content:', content, typeof content)

    if (typeof content === 'string') {
      return content
    }
    if (typeof content === 'object' && content) {
      return content.syntax || content.mermaidSyntax || content.content || ''
    }
    return 'graph LR\n    A[No Content] --> B[Error]'
  }, [content])

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 5

    const renderMermaid = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log(`🔧 ROBUST: Starting Mermaid render (attempt ${retryCount + 1}/${maxRetries})`)

        if (!containerRef.current) {
          console.error('🔧 ROBUST: Container ref is null')
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(renderMermaid, 500)
            return
          }
          throw new Error('Container not available after retries')
        }

        const container = containerRef.current
        console.log('🔧 ROBUST: Container found:', container)
        console.log('🔧 ROBUST: Container in DOM:', document.contains(container))

        const containerRect = container.getBoundingClientRect()
        console.log('🔧 ROBUST: Container dimensions:', containerRect.width, 'x', containerRect.height)

        // Wait for container to have dimensions
        if (containerRect.width === 0 || containerRect.height === 0) {
          console.log('🔧 ROBUST: Container has zero dimensions, retrying...')
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(renderMermaid, 500)
            return
          }
          throw new Error('Container never gained dimensions')
        }

        // Use pre-initialized Mermaid service
        const mermaidService = MermaidService.getInstance()
        await mermaidService.initialize()

        // Clear and create mermaid div
        container.innerHTML = ''
        const mermaidDiv = document.createElement('div')
        mermaidDiv.className = 'mermaid'
        mermaidDiv.textContent = mermaidSyntax

        // Force explicit styles (using the working pattern from debug page)
        mermaidDiv.style.cssText = `
          width: 600px !important;
          height: 400px !important;
          display: block !important;
          visibility: visible !important;
          background: rgba(0,255,0,0.1) !important;
          border: 2px solid green !important;
        `

        container.appendChild(mermaidDiv)
        console.log('🔧 ROBUST: Mermaid div created and appended')

        // Force reflow
        mermaidDiv.offsetHeight

        // Check dimensions
        const mermaidRect = mermaidDiv.getBoundingClientRect()
        console.log('🔧 ROBUST: Mermaid div dimensions:', mermaidRect.width, 'x', mermaidRect.height)
        console.log('🔧 ROBUST: Mermaid div in DOM:', document.contains(mermaidDiv))

        if (mermaidRect.width > 0 && mermaidRect.height > 0) {
          console.log('🔧 ROBUST: Dimensions OK, calling mermaid service render')
          await mermaidService.renderDiagram(mermaidDiv, mermaidSyntax)
          console.log('🔧 ROBUST: Mermaid service render SUCCESS!')
          setIsLoading(false)
        } else {
          console.error('🔧 ROBUST: FAILED - Zero dimensions')
          throw new Error('Cannot render Mermaid: element has zero dimensions')
        }

      } catch (err) {
        console.error('🔧 ROBUST: Mermaid error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
        setIsLoading(false)
      }
    }

    // Small delay to ensure DOM is ready, then start rendering
    const timer = setTimeout(() => {
      renderMermaid()
    }, 100)

    return () => clearTimeout(timer)
  }, [mermaidSyntax, retryTrigger])

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#fff5f5',
        border: '1px solid #fed7d7',
        borderRadius: '8px'
      }}>
        <div style={{ 
          color: '#c53030', 
          fontSize: '18px', 
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          ❌ Rendering Error
        </div>
        <div style={{
          color: '#742a2a',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '400px',
          marginBottom: '16px'
        }}>
          Cannot render Mermaid: {error}
        </div>
        <button
          onClick={() => setRetryTrigger(prev => prev + 1)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Retry Rendering
        </button>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: '400px' }}>
      {/* Viewer Controls */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(255,255,255,0.9)', borderRadius: '8px', padding: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
          <span>📝</span>
          <span>Mermaid View (Fixed)</span>
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

      {/* Diagram Container - Using the working pattern from debug page */}
      <div
        ref={containerRef}
        style={{
          width: '800px',
          height: '500px',
          border: '3px solid blue',
          backgroundColor: '#f0f8ff',
          margin: '20px auto',
          position: 'relative',
          display: 'block'
        }}
      >
        <p style={{ padding: '10px', margin: 0, fontSize: '14px', color: '#666' }}>
          {isLoading ? 'Loading Mermaid...' : 'Mermaid container ready'}
        </p>
      </div>
    </div>
  )
}
