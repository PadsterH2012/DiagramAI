'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

export default function TestMermaidPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mermaidSyntax = `graph LR
    A --> B
    B --> C`

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('Test page: Rendering Mermaid diagram')

        if (!containerRef.current) {
          console.error('Container not found')
          return
        }

        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        })

        const container = containerRef.current
        container.innerHTML = ''

        // Create mermaid div
        const mermaidDiv = document.createElement('div')
        mermaidDiv.className = 'mermaid'
        mermaidDiv.textContent = mermaidSyntax
        mermaidDiv.style.width = '100%'
        mermaidDiv.style.height = '400px'
        mermaidDiv.style.border = '2px solid red' // Debug border
        container.appendChild(mermaidDiv)

        // Check dimensions
        const rect = mermaidDiv.getBoundingClientRect()
        console.log('Test page: Mermaid div dimensions:', rect.width, 'x', rect.height)

        // Try mermaid.init
        await mermaid.init(undefined, mermaidDiv)
        console.log('Test page: Mermaid init completed')

        setIsLoading(false)
      } catch (err) {
        console.error('Test page: Mermaid error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render')
        setIsLoading(false)
      }
    }

    setTimeout(renderDiagram, 500)
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mermaid Test Page</h1>
      <p>This is a simple test to debug Mermaid rendering issues.</p>
      
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <div 
        ref={containerRef}
        style={{
          width: '800px',
          height: '400px',
          border: '2px solid blue',
          backgroundColor: '#f0f0f0',
          margin: '20px 0'
        }}
      />
      
      <div>
        <h3>Expected Mermaid Syntax:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          {mermaidSyntax}
        </pre>
      </div>
    </div>
  )
}
