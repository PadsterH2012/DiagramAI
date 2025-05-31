import React, { useState, useEffect } from 'react'

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

interface ProjectListProps {
  onSelectProject?: (project: Project | null) => void
  selectedProjectId?: string | null
  className?: string
}

export default function ProjectList({ onSelectProject, selectedProjectId, className = '' }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      const data = await response.json()
      
      if (data.success) {
        setProjects(data.data)
      } else {
        setError(data.error?.message || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Failed to fetch projects')
      console.error('Fetch projects error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(selectedProjectId === project.id ? null : project)
    }
  }

  const handleAllProjectsClick = () => {
    if (onSelectProject) {
      onSelectProject(null)
    }
  }

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-600 text-sm">{error}</div>
        <button 
          onClick={fetchProjects}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-1">
        {/* All Projects Option */}
        <button
          onClick={handleAllProjectsClick}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            selectedProjectId === null
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="font-medium">📋 All Projects</span>
        </button>

        {/* Individual Projects */}
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => handleProjectClick(project)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedProjectId === project.id
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {project.color && (
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: project.color }}
                  />
                )}
                <span className="font-medium truncate">{project.name}</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {project._count.diagrams}
              </span>
            </div>
            {project.description && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                {project.description}
              </div>
            )}
          </button>
        ))}

        {projects.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            No projects found
          </div>
        )}
      </div>
    </div>
  )
}