'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProjectList from '../../src/components/Projects/ProjectList'
import ProjectForm from '../../src/components/Projects/ProjectForm'
import Breadcrumb from '../../src/components/Navigation/Breadcrumb'

interface Project {
  id: string
  name: string
  description?: string
  color?: string
  createdAt: string
  updatedAt: string
  _count: {
    diagrams: number
  }
}

interface Diagram {
  id: string
  title: string
  description?: string
  format: 'reactflow' | 'mermaid'
  isPublic: boolean
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
    color?: string
  } | null
}

export default function DashboardPage() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFavorites, setFilterFavorites] = useState(false)

  useEffect(() => {
    fetchDiagrams()
  }, [selectedProject, searchQuery, filterFavorites])

  const fetchDiagrams = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedProject) {
        params.append('project_id', selectedProject.id)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (filterFavorites) {
        params.append('favorites', 'true')
      }
      
      const url = `/api/diagrams${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
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

  const handleCreateProject = async (projectData: { name: string; description?: string; color?: string }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create project')
      }
      
      // Refresh the diagrams to update project counts
      fetchDiagrams()
    } catch (error) {
      throw error
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
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', isActive: true }
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                {selectedProject 
                  ? `Viewing diagrams in "${selectedProject.name}"` 
                  : 'Manage your diagrams and track your progress'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProjectForm(true)}
                className="btn-secondary"
              >
                📁 New Project
              </button>
              <Link href="/editor" className="btn-primary">
                Create New Diagram
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Projects</h2>
              </div>
              <ProjectList
                selectedProjectId={selectedProject?.id || null}
                onSelectProject={setSelectedProject}
                className="p-2"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Diagrams List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedProject ? `Diagrams in "${selectedProject.name}"` : 'Recent Diagrams'}
                  </h2>
                  
                  {/* Search and Filter */}
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search diagrams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                      />
                      <svg
                        className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    
                    {/* Favorites Filter */}
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filterFavorites}
                        onChange={(e) => setFilterFavorites(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">⭐ Favorites only</span>
                    </label>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {selectedProject && (
                        <button
                          onClick={() => setSelectedProject(null)}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Show All
                        </button>
                      )}
                      <button
                        onClick={fetchDiagrams}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        {loading ? '🔄' : '↻'} Refresh
                      </button>
                    </div>
                  </div>
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
                  <p className="text-gray-500 mb-2">📊 No diagrams found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {searchQuery || filterFavorites
                      ? `No diagrams match your current filters.`
                      : selectedProject 
                      ? `No diagrams in "${selectedProject.name}" yet.`
                      : 'Create your first diagram or have an AI agent create one for you!'
                    }
                  </p>
                  {(searchQuery || filterFavorites) && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setFilterFavorites(false)
                      }}
                      className="btn-secondary inline-block mr-3"
                    >
                      Clear Filters
                    </button>
                  )}
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
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900">{diagram.title}</h3>
                            {diagram.isFavorite && (
                              <span className="text-yellow-500 text-sm">⭐</span>
                            )}
                          </div>
                          {diagram.description && (
                            <p className="text-xs text-gray-600 mt-1">{diagram.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            {diagram.project && !selectedProject && (
                              <div className="flex items-center space-x-1">
                                {diagram.project.color && (
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: diagram.project.color }}
                                  />
                                )}
                                <span className="text-xs text-gray-500">{diagram.project.name}</span>
                              </div>
                            )}
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
        </div>
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}
