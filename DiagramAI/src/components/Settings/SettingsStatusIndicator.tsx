'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { SettingsStorage } from '../../services/settingsStorage'

interface SettingsStatusIndicatorProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const SettingsStatusIndicator: React.FC<SettingsStatusIndicatorProps> = ({
  className = '',
  showText = true,
  size = 'md'
}) => {
  const [hasConfiguredProviders, setHasConfiguredProviders] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null)

  useEffect(() => {
    checkSettingsStatus()
  }, [])

  const checkSettingsStatus = async () => {
    try {
      const [hasProviders, provider] = await Promise.all([
        SettingsStorage.hasConfiguredProviders(),
        SettingsStorage.getDefaultProvider()
      ])
      
      setHasConfiguredProviders(hasProviders)
      setDefaultProvider(provider)
    } catch (error) {
      console.error('Failed to check settings status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3 text-xs'
      case 'lg':
        return 'w-6 h-6 text-lg'
      default:
        return 'w-4 h-4 text-sm'
    }
  }

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: '⏳',
        text: 'Checking...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200'
      }
    }

    if (hasConfiguredProviders) {
      return {
        icon: '✅',
        text: `AI Ready (${defaultProvider?.toUpperCase()})`,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      }
    }

    return {
      icon: '⚙️',
      text: 'Setup Required',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    }
  }

  const status = getStatusInfo()

  if (showText) {
    return (
      <Link
        href="/settings"
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-md border transition-colors hover:opacity-80 ${status.bgColor} ${status.borderColor} ${status.color} ${className}`}
      >
        <span className={getSizeClasses()}>{status.icon}</span>
        <span className="text-sm font-medium">{status.text}</span>
      </Link>
    )
  }

  return (
    <Link
      href="/settings"
      className={`inline-flex items-center justify-center rounded-full border transition-colors hover:opacity-80 ${status.bgColor} ${status.borderColor} ${status.color} ${getSizeClasses()} ${className}`}
      title={status.text}
    >
      {status.icon}
    </Link>
  )
}

// Hook for checking settings status in other components
export const useSettingsStatus = () => {
  const [hasConfiguredProviders, setHasConfiguredProviders] = useState(false)
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkStatus = async () => {
    try {
      setIsLoading(true)
      const [hasProviders, provider] = await Promise.all([
        SettingsStorage.hasConfiguredProviders(),
        SettingsStorage.getDefaultProvider()
      ])
      
      setHasConfiguredProviders(hasProviders)
      setDefaultProvider(provider)
    } catch (error) {
      console.error('Failed to check settings status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return {
    hasConfiguredProviders,
    defaultProvider,
    isLoading,
    refresh: checkStatus
  }
}
