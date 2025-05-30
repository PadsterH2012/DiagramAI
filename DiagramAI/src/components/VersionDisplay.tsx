'use client'

import { useState, useEffect } from 'react'

interface VersionInfo {
  version: string
  buildDate: string
  gitCommit: string
  nodeEnv: string
  timestamp: string
}

export default function VersionDisplay() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('/api/version')
        if (!response.ok) {
          throw new Error('Failed to fetch version info')
        }
        const data = await response.json()
        setVersionInfo(data)
      } catch (err) {
        console.error('Error fetching version info:', err)
        setError('Failed to load version')
        // Fallback to environment variables if API fails
        setVersionInfo({
          version: process.env.APP_VERSION || '1.0.45',
          buildDate: process.env.BUILD_DATE || 'unknown',
          gitCommit: process.env.GIT_COMMIT || 'unknown',
          nodeEnv: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString()
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersionInfo()
  }, [])

  if (isLoading) {
    return (
      <span className="text-xs text-gray-400">
        Loading...
      </span>
    )
  }

  if (error && !versionInfo) {
    return (
      <span className="text-xs text-red-400">
        Version unavailable
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const shortCommit = versionInfo?.gitCommit?.substring(0, 8) || 'unknown'

  return (
    <div className="text-xs text-gray-500 flex items-center space-x-2">
      <span className="font-medium">v{versionInfo?.version}</span>
      {versionInfo?.buildDate && versionInfo.buildDate !== 'unknown' && (
        <span className="hidden sm:inline">
          • {formatDate(versionInfo.buildDate)}
        </span>
      )}
      {versionInfo?.gitCommit && versionInfo.gitCommit !== 'unknown' && (
        <span className="hidden md:inline font-mono">
          • {shortCommit}
        </span>
      )}
      {versionInfo?.nodeEnv === 'development' && (
        <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs">
          DEV
        </span>
      )}
    </div>
  )
}
