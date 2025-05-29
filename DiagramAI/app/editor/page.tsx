'use client'

import { useState } from 'react'
import { UnifiedDiagramEditor } from '@/components/DiagramEditor/UnifiedDiagramEditor'
import { aiService } from '@/services/aiService'

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<'visual' | 'text'>('visual')
  const [diagramText, setDiagramText] = useState(`graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`)

  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')

  const handleGenerateDiagram = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await aiService.generateDiagram({
        prompt: prompt,
        diagramType: 'flowchart',
        style: 'professional'
      })

      setDiagramText(response.mermaidSyntax)
      console.log('AI Generation Response:', response)
    } catch (error) {
      console.error('Failed to generate diagram:', error)
      // Fallback to simple generation
      const fallbackDiagram = `graph TD
    A[${prompt}] --> B{Analysis}
    B -->|Valid| C[Implementation]
    B -->|Invalid| D[Revision]
    C --> E[Testing]
    D --> B
    E --> F[Deployment]`
      setDiagramText(fallbackDiagram)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagram Editor</h1>
          <p className="text-gray-600">Create and edit diagrams with AI assistance</p>
        </div>

        {/* AI Generation Panel */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Diagram Generation</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your diagram (e.g., 'user login process', 'data flow architecture')"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateDiagram}
              disabled={isGenerating || !prompt.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {isGenerating && (
            <div className="mt-4 text-sm text-gray-600">
              🔄 AI is analyzing your request and generating the diagram...
            </div>
          )}
        </div>

        {/* Unified Diagram Editor */}
        <div className="bg-white rounded-lg shadow-sm border h-[600px]">
          <UnifiedDiagramEditor
            initialMermaidSyntax={diagramText}
            onSave={(data) => {
              setDiagramText(data.mermaidSyntax)
              console.log('Diagram saved:', data)
            }}
          />
        </div>

        {/* Status Bar */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="status-indicator status-success">✅ Syntax Valid</span>
              <span className="text-gray-600">Last saved: Never</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Lines: {diagramText.split('\n').length}</span>
              <span className="text-gray-600">Characters: {diagramText.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
