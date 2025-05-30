'use client'

import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

export default function DebugMermaidPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderMermaid = async () => {
      console.log('🔧 DEBUG: Starting Mermaid render')
      
      if (!containerRef.current) {
        console.error('🔧 DEBUG: Container ref is null')
        return
      }

      const container = containerRef.current
      console.log('🔧 DEBUG: Container found:', container)
      console.log('🔧 DEBUG: Container in DOM:', document.contains(container))
      
      const containerRect = container.getBoundingClientRect()
      console.log('🔧 DEBUG: Container dimensions:', containerRect.width, 'x', containerRect.height)

      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })

      // Clear and create mermaid div
      container.innerHTML = ''
      const mermaidDiv = document.createElement('div')
      mermaidDiv.className = 'mermaid'
      mermaidDiv.textContent = 'graph LR\n    A --> B\n    B --> C'
      
      // Force explicit styles
      mermaidDiv.style.cssText = `
        width: 600px !important;
        height: 400px !important;
        display: block !important;
        visibility: visible !important;
        background: rgba(0,255,0,0.1) !important;
        border: 3px solid green !important;
      `
      
      container.appendChild(mermaidDiv)
      console.log('🔧 DEBUG: Mermaid div created and appended')
      
      // Force reflow
      mermaidDiv.offsetHeight
      
      // Check dimensions
      const mermaidRect = mermaidDiv.getBoundingClientRect()
      console.log('🔧 DEBUG: Mermaid div dimensions:', mermaidRect.width, 'x', mermaidRect.height)
      console.log('🔧 DEBUG: Mermaid div in DOM:', document.contains(mermaidDiv))
      
      if (mermaidRect.width > 0 && mermaidRect.height > 0) {
        console.log('🔧 DEBUG: Dimensions OK, calling mermaid.init')
        try {
          await mermaid.init(undefined, mermaidDiv)
          console.log('🔧 DEBUG: Mermaid init SUCCESS!')
        } catch (error) {
          console.error('🔧 DEBUG: Mermaid init FAILED:', error)
        }
      } else {
        console.error('🔧 DEBUG: FAILED - Zero dimensions')
      }
    }

    // Delay to ensure DOM is ready
    setTimeout(renderMermaid, 1000)
  }, [])

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      <h1>Debug Mermaid Page</h1>
      <p>This page tests Mermaid rendering in isolation with explicit container dimensions.</p>
      
      <div 
        ref={containerRef}
        style={{
          width: '800px',
          height: '500px',
          border: '3px solid blue',
          backgroundColor: '#f0f8ff',
          margin: '20px 0',
          position: 'relative',
          display: 'block'
        }}
      >
        <p style={{ padding: '10px', margin: 0 }}>Container ready for Mermaid...</p>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Check browser console for detailed debug logs.</p>
        <p>Container should have blue border, Mermaid div should have green border when created.</p>
      </div>
    </div>
  )
}
