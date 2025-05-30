'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import components to avoid SSR issues
const ReactFlowViewer = dynamic(() => import('@/components/ReactFlowViewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading ReactFlow...</div>
})
const MermaidViewer = dynamic(() => import('@/components/MermaidViewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading Mermaid...</div>
})

interface Diagram {
  id: string
  title: string
  description?: string
  content: any
  format: 'reactflow' | 'mermaid'
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function DiagramViewPage() {
  const params = useParams()
  const router = useRouter()
  const [diagram, setDiagram] = useState<Diagram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchDiagram(params.id as string)
    }
  }, [params.id])

  const fetchDiagram = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/diagrams/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setDiagram(result.data)
      } else {
        setError(result.error?.message || 'Failed to fetch diagram')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching diagram:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading diagram...</p>
        </div>
      </div>
    )
  }

  if (error || !diagram) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">❌ {error || 'Diagram not found'}</p>
          <div className="space-x-4">
            <button 
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Go Back
            </button>
            <Link href="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{diagram.title}</h1>
                {diagram.description && (
                  <p className="text-gray-600 mt-1">{diagram.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                diagram.format === 'reactflow' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {diagram.format === 'reactflow' ? '🎨 Visual' : '📝 Mermaid'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                diagram.isPublic 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {diagram.isPublic ? '🌐 Public' : '🔒 Private'}
              </span>
              <Link 
                href={`/editor?id=${diagram.id}`}
                className="btn-primary"
              >
                Edit Diagram
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Diagram Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-[calc(100vh-200px)]">
            {diagram.format === 'reactflow' ? (
              <ReactFlowViewer content={diagram.content} />
            ) : (
              <MermaidViewer content={diagram.content} />
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagram Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">{formatDate(diagram.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Modified:</span>
              <span className="ml-2 text-gray-600">{formatDate(diagram.updatedAt)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Format:</span>
              <span className="ml-2 text-gray-600 capitalize">{diagram.format}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Visibility:</span>
              <span className="ml-2 text-gray-600">{diagram.isPublic ? 'Public' : 'Private'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
