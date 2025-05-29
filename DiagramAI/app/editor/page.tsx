'use client'

import { useState } from 'react'
import { UnifiedDiagramEditor } from '@/components/DiagramEditor/UnifiedDiagramEditor'

export default function EditorPage() {
  const [diagramText, setDiagramText] = useState(`graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`)



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagram Editor</h1>
          <p className="text-gray-600">Create and edit diagrams with AI assistance</p>
        </div>

        {/* Unified Diagram Editor */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 h-[calc(100vh-180px)] overflow-hidden">
          <UnifiedDiagramEditor
            initialMermaidSyntax={diagramText}
            onSave={(data) => {
              setDiagramText(data.mermaidSyntax)
              console.log('Diagram saved:', data)
            }}
          />
        </div>

        {/* Status Bar */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Syntax Valid
              </span>
              <span className="text-gray-500">Last saved: Never</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-500">
              <span>Lines: {diagramText.split('\n').length}</span>
              <span>Characters: {diagramText.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
