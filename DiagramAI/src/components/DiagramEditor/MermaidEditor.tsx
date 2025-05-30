'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

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

  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // percentage
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Pan functionality state
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

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

  // Resizable panel handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Constrain between 20% and 80%
    const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth))
    setLeftPanelWidth(constrainedWidth)
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Pan functionality handlers
  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    setIsPanning(true)
    setIsDragging(false)
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }, [panOffset])

  const handlePanMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return

    setIsDragging(true)
    const newOffset = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    }
    setPanOffset(newOffset)
  }, [isPanning, panStart])

  const handlePanMouseUp = useCallback(() => {
    setIsPanning(false)
    // Small delay to prevent click events when dragging
    setTimeout(() => setIsDragging(false), 100)
  }, [])

  // Global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handlePanMouseMove)
      document.addEventListener('mouseup', handlePanMouseUp)
      document.body.style.cursor = isDragging ? 'grabbing' : 'grab'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handlePanMouseMove)
      document.removeEventListener('mouseup', handlePanMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isPanning, isDragging, handlePanMouseMove, handlePanMouseUp])

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
    <div ref={containerRef} className="flex h-full mermaid-editor relative">
      {/* Editor Panel */}
      <div
        className="border-r border-gray-200 flex flex-col"
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3 flex-shrink-0">
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
        <div className="relative flex-1 overflow-hidden">
          <textarea
            className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 leading-relaxed overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
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
              <div><code>A --&gt; B</code> - Arrow</div>
              <div><code>A --&gt;|Label| B</code> - Labeled Arrow</div>
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Separator */}
      <div
        className={`absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors z-10 ${
          isResizing ? 'bg-blue-500' : ''
        }`}
        style={{ left: `${leftPanelWidth}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        title="Drag to resize panels"
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-gray-400 rounded-sm flex items-center justify-center">
          <div className="w-0.5 h-4 bg-white rounded-full mx-0.5"></div>
          <div className="w-0.5 h-4 bg-white rounded-full mx-0.5"></div>
        </div>
      </div>

      {/* Preview Panel */}
      <div
        className="flex flex-col"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">Preview</span>
          <div className="flex items-center space-x-2">
            {renderError && (
              <span className="text-xs text-red-600">⚠️ Syntax Error</span>
            )}
            <button
              onClick={() => setPanOffset({ x: 0, y: 0 })}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              title="Reset Pan Position"
            >
              🎯 Reset
            </button>
            <span className="text-xs text-gray-500">
              {isDragging ? '✋ Dragging' : '👆 Click & drag to pan'}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <div
            className={`w-full h-full p-4 ${isPanning ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
            onMouseDown={handlePanMouseDown}
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isPanning ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <div ref={previewRef} className="w-full h-full flex items-center justify-center min-h-[400px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
