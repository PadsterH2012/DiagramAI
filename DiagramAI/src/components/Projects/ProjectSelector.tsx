import React, { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  description?: string
  color?: string
}

interface ProjectSelectorProps {
  selectedProjectId?: string | null
  onProjectChange: (projectId: string | null) => void
  className?: string
  allowNone?: boolean
}

export default function ProjectSelector({ 
  selectedProjectId, 
  onProjectChange, 
  className = '',
  allowNone = true 
}: ProjectSelectorProps) {
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

  if (loading) {
    return (
      <div className={className}>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" disabled>
          <option>Loading projects...</option>
        </select>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <select className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50" disabled>
          <option>Error loading projects</option>
        </select>
        <p className="text-red-600 text-xs mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <select
        value={selectedProjectId || ''}
        onChange={(e) => onProjectChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {allowNone && (
          <option value="">No Project</option>
        )}
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      
      {projects.length === 0 && (
        <p className="text-gray-500 text-xs mt-1">
          No projects available. 
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="text-blue-600 hover:text-blue-800 ml-1"
          >
            Create one?
          </button>
        </p>
      )}
    </div>
  )
}