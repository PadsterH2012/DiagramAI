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

  const insertTemplate = (template: string) => {
    setSyntax(template)
    onSyntaxChange?.(template)
  }

  const templates = {
    flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
    sequence: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hello Alice!
    A->>B: How are you?
    B-->>A: I'm good, thanks!`,
    gantt: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Research    :done, research, 2024-01-01, 2024-01-15
    Design      :active, design, 2024-01-10, 2024-01-25
    section Development
    Frontend    :frontend, 2024-01-20, 2024-02-15
    Backend     :backend, 2024-01-25, 2024-02-20`,
    pie: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rabbits" : 15`
  }

  return (
    <div className="flex h-full mermaid-editor">
      {/* Editor Panel */}
      <div className="w-1/2 border-r border-gray-200">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3">
          <span className="text-sm font-medium text-gray-700">Mermaid Syntax</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => insertTemplate(templates.flowchart)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="Insert Flowchart Template"
            >
              📊 Flow
            </button>
            <button
              onClick={() => insertTemplate(templates.sequence)}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              title="Insert Sequence Diagram Template"
            >
              🔄 Seq
            </button>
            <button
              onClick={() => insertTemplate(templates.gantt)}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              title="Insert Gantt Chart Template"
            >
              📅 Gantt
            </button>
            <button
              onClick={() => insertTemplate(templates.pie)}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              title="Insert Pie Chart Template"
            >
              🥧 Pie
            </button>
          </div>
        </div>
        <div className="relative w-full h-[calc(100%-2rem)]">
          <textarea
            className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 leading-relaxed"
            value={syntax}
            onChange={handleSyntaxChange}
            readOnly={readOnly}
            placeholder="Enter your Mermaid diagram syntax here...

Examples:
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D

flowchart LR
    A --> B --> C

sequenceDiagram
    Alice->>Bob: Hello
    Bob-->>Alice: Hi!"
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              tabSize: 4,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
            }}
          />

          {/* Syntax Helper Overlay */}
          <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded-md shadow-sm p-2 text-xs text-gray-600 max-w-xs">
            <div className="font-semibold mb-1">Quick Reference:</div>
            <div className="space-y-1">
              <div><code>graph TD</code> - Top Down</div>
              <div><code>graph LR</code> - Left Right</div>
              <div><code>A[Box]</code> - Rectangle</div>
              <div><code>B&#123;Diamond&#125;</code> - Decision</div>
              <div><code>C((Circle))</code> - Circle</div>
              <div><code>A --> B</code> - Arrow</div>
              <div><code>A -->|Label| B</code> - Labeled Arrow</div>
            </div>
          </div>
        </div>
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
