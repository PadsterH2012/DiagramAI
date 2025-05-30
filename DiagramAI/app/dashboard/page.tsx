'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Diagram {
  id: string
  title: string
  description?: string
  format: 'reactflow' | 'mermaid'
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDiagrams()
  }, [])

  const fetchDiagrams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/diagrams')
      const result = await response.json()

      if (result.success) {
        setDiagrams(result.data)
      } else {
        setError(result.error?.message || 'Failed to fetch diagrams')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching diagrams:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const stats = [
    { label: 'Total Diagrams', value: diagrams.length.toString(), change: `${diagrams.filter(d => new Date(d.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week` },
    { label: 'ReactFlow Diagrams', value: diagrams.filter(d => d.format === 'reactflow').length.toString(), change: 'Visual editor' },
    { label: 'Mermaid Diagrams', value: diagrams.filter(d => d.format === 'mermaid').length.toString(), change: 'Text-based' },
    { label: 'Public Diagrams', value: diagrams.filter(d => d.isPublic).length.toString(), change: 'Shared' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Manage your diagrams and track your progress</p>
            </div>
            <Link href="/editor" className="btn-primary">
              Create New Diagram
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Diagrams List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Diagrams</h2>
                  <button
                    onClick={fetchDiagrams}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    {loading ? '🔄' : '↻'} Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading diagrams...</p>
                </div>
              ) : error ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-red-600 mb-2">❌ {error}</p>
                  <button
                    onClick={fetchDiagrams}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Try again
                  </button>
                </div>
              ) : diagrams.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 mb-2">📊 No diagrams yet</p>
                  <p className="text-sm text-gray-400 mb-4">Create your first diagram or have an AI agent create one for you!</p>
                  <Link href="/editor" className="btn-primary inline-block">
                    Create Diagram
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {diagrams.map((diagram) => (
                    <div key={diagram.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{diagram.title}</h3>
                          {diagram.description && (
                            <p className="text-xs text-gray-600 mt-1">{diagram.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 capitalize">
                              {diagram.format === 'reactflow' ? '🎨 Visual' : '📝 Mermaid'}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(diagram.updatedAt)}</span>
                            <span className={`status-indicator text-xs ${
                              diagram.isPublic ? 'status-success' : 'status-warning'
                            }`}>
                              {diagram.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/editor?id=${diagram.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/diagram/${diagram.id}`}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {diagrams.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Link href="/diagrams" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all diagrams →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/editor" className="block w-full btn-primary text-center">
                  🎨 Create Diagram
                </Link>
                <button className="block w-full btn-secondary">
                  📤 Import Mermaid
                </button>
                <button className="block w-full btn-secondary">
                  👥 Invite Collaborator
                </button>
                <button className="block w-full btn-secondary">
                  📊 View Analytics
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Application</span>
                  <span className="status-indicator status-success text-xs">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="status-indicator status-success text-xs">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Services</span>
                  <span className="status-indicator status-warning text-xs">Setup Required</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache</span>
                  <span className="status-indicator status-success text-xs">Active</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">🎨</span>
                  <div>
                    <p className="text-gray-900">Created new diagram</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="text-gray-900">Published diagram</p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">🤖</span>
                  <div>
                    <p className="text-gray-900">AI generated flowchart</p>
                    <p className="text-gray-500 text-xs">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
