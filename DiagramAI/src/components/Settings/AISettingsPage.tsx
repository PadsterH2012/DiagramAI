'use client'

import React, { useState, useEffect } from 'react'
import { AIProviderCard } from './AIProviderCard'
import { SettingsImportExport } from './SettingsImportExport'
import { SettingsStorage } from '../../services/settingsStorage'
import { AIProviderService } from '../../services/aiProviderService'

export interface AIProvider {
  id: 'openai' | 'anthropic' | 'openrouter'
  name: string
  description: string
  icon: string
  color: string
  apiKey: string
  selectedModel: string
  isValidated: boolean
  availableModels: Array<{
    id: string
    name: string
    description?: string
    pricing?: {
      input: number
      output: number
    }
  }>
}

export const AISettingsPage: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5, and other OpenAI models',
      icon: '🤖',
      color: '#10a37f',
      apiKey: '',
      selectedModel: '',
      isValidated: false,
      availableModels: []
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude 3.5 Sonnet, Claude 3 Opus, and other Claude models',
      icon: '🧠',
      color: '#d97706',
      apiKey: '',
      selectedModel: '',
      isValidated: false,
      availableModels: []
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access to hundreds of AI models through a unified API',
      icon: '🌐',
      color: '#3b82f6',
      apiKey: '',
      selectedModel: '',
      isValidated: false,
      availableModels: []
    }
  ])

  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await SettingsStorage.loadSettings()
      
      setProviders(prevProviders => 
        prevProviders.map(provider => ({
          ...provider,
          apiKey: settings.providers[provider.id]?.apiKey || '',
          selectedModel: settings.providers[provider.id]?.selectedModel || '',
          isValidated: settings.providers[provider.id]?.isValidated || false,
          availableModels: settings.providers[provider.id]?.availableModels || []
        }))
      )
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderUpdate = async (providerId: string, updates: Partial<AIProvider>) => {
    setProviders(prevProviders =>
      prevProviders.map(provider =>
        provider.id === providerId
          ? { ...provider, ...updates }
          : provider
      )
    )

    // Auto-save when provider is updated
    await saveSettings()
  }

  const handleValidateApiKey = async (providerId: string, apiKey: string) => {
    try {
      const provider = providers.find(p => p.id === providerId)
      if (!provider) return { isValid: false, error: 'Provider not found' }

      // Validate API key and fetch available models
      const result = await AIProviderService.validateApiKey(providerId as any, apiKey)
      
      if (result.isValid) {
        await handleProviderUpdate(providerId, {
          apiKey,
          isValidated: true,
          availableModels: result.models || [],
          selectedModel: result.models?.[0]?.id || ''
        })
      } else {
        await handleProviderUpdate(providerId, {
          apiKey,
          isValidated: false,
          availableModels: [],
          selectedModel: ''
        })
      }

      return result
    } catch (error) {
      console.error('API key validation failed:', error)
      return { isValid: false, error: 'Validation failed' }
    }
  }

  const saveSettings = async () => {
    setSaveStatus('saving')
    try {
      await SettingsStorage.saveSettings({
        providers: providers.reduce((acc, provider) => ({
          ...acc,
          [provider.id]: {
            apiKey: provider.apiKey,
            selectedModel: provider.selectedModel,
            isValidated: provider.isValidated,
            availableModels: provider.availableModels
          }
        }), {})
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleClearAllSettings = async () => {
    if (confirm('Are you sure you want to clear all AI provider settings? This action cannot be undone.')) {
      try {
        await SettingsStorage.clearSettings()
        await loadSettings()
      } catch (error) {
        console.error('Failed to clear settings:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`rounded-md p-4 ${
          saveStatus === 'saving' ? 'bg-blue-50 text-blue-700' :
          saveStatus === 'saved' ? 'bg-green-50 text-green-700' :
          'bg-red-50 text-red-700'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {saveStatus === 'saving' && <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
              {saveStatus === 'saved' && <span className="text-lg">✅</span>}
              {saveStatus === 'error' && <span className="text-lg">❌</span>}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {saveStatus === 'saving' && 'Saving settings...'}
                {saveStatus === 'saved' && 'Settings saved successfully!'}
                {saveStatus === 'error' && 'Failed to save settings. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provider Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => (
          <AIProviderCard
            key={provider.id}
            provider={provider}
            onUpdate={(updates) => handleProviderUpdate(provider.id, updates)}
            onValidateApiKey={(apiKey) => handleValidateApiKey(provider.id, apiKey)}
          />
        ))}
      </div>

      {/* Import/Export Section */}
      <SettingsImportExport onSettingsImported={loadSettings} />

      {/* Actions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
            <p className="text-sm text-gray-500">
              Irreversible actions that will affect all your AI provider settings.
            </p>
          </div>
          <button
            onClick={handleClearAllSettings}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Clear All Settings
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Getting Started</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>OpenAI:</strong> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></p>
          <p>• <strong>Anthropic:</strong> Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a></p>
          <p>• <strong>OpenRouter:</strong> Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a></p>
          <p>• Your API keys are stored locally and encrypted for security</p>
          <p>• Models are automatically fetched when you validate your API key</p>
        </div>
      </div>
    </div>
  )
}
