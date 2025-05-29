'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MermaidEditorProps {
  initialSyntax?: string
  onSyntaxChange?: (syntax: string) => void
  readOnly?: boolean
  theme?: 'light' | 'dark'
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({
  initialSyntax = '',
  onSyntaxChange,
  readOnly = false,
  theme = 'light',
}) => {
  const [syntax, setSyntax] = useState(initialSyntax)
  const [renderError, setRenderError] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Render Mermaid diagram
  useEffect(() => {
    if (!syntax.trim() || !previewRef.current) return

    const renderDiagram = async () => {
      try {
        setRenderError(null)
        
        // Import and render with mermaid.js
        const mermaid = await import('mermaid')

        // Initialize mermaid
        mermaid.default.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        })

        // Generate unique ID for this diagram
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        try {
          // Render the mermaid diagram
          const result = await mermaid.default.render(diagramId, syntax)

          previewRef.current!.innerHTML = `
            <div class="w-full h-full flex flex-col">
              <div class="text-gray-700 font-medium mb-2 text-sm">✅ Mermaid Diagram</div>
              <div class="flex-1 flex justify-center items-center overflow-auto">
                ${result.svg}
              </div>
            </div>
          `
        } catch (renderError) {
          throw new Error(`Mermaid syntax error: ${renderError instanceof Error ? renderError.message : 'Invalid diagram syntax'}`)
        }
        
      } catch (error) {
        console.error('Mermaid render error:', error)
        setRenderError(error instanceof Error ? error.message : 'Render error')
        previewRef.current!.innerHTML = `
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="text-red-800 font-medium">Syntax Error</div>
            <div class="text-red-600 text-sm mt-1">${error instanceof Error ? error.message : 'Unknown error'}</div>
          </div>
        `
      }
    }

    const debounceTimer = setTimeout(renderDiagram, 500)
    return () => clearTimeout(debounceTimer)
  }, [syntax])

  const handleSyntaxChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSyntax = event.target.value
    setSyntax(newSyntax)
    onSyntaxChange?.(newSyntax)
  }

  return (
    <div className="flex h-full">
      {/* Editor Panel */}
      <div className="w-1/2 border-r border-gray-200">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
          <span className="text-sm font-medium text-gray-700">Mermaid Syntax</span>
        </div>
        <textarea
          className="w-full h-[calc(100%-2rem)] p-4 font-mono text-sm border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={syntax}
          onChange={handleSyntaxChange}
          readOnly={readOnly}
          placeholder="Enter your Mermaid diagram syntax here..."
        />
      </div>

      {/* Preview Panel */}
      <div className="w-1/2">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
          <span className="text-sm font-medium text-gray-700">Preview</span>
          {renderError && (
            <span className="ml-2 text-xs text-red-600">⚠️ Syntax Error</span>
          )}
        </div>
        <div className="h-[calc(100%-2rem)] overflow-auto p-4 bg-white">
          <div ref={previewRef} className="w-full h-full flex items-center justify-center" />
        </div>
      </div>
    </div>
  )
}
