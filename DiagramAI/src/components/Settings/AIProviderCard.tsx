'use client'

import React, { useState } from 'react'
import { AIProvider } from './AISettingsPage'

interface AIProviderCardProps {
  provider: AIProvider
  onUpdate: (updates: Partial<AIProvider>) => void
  onValidateApiKey: (apiKey: string) => Promise<{ isValid: boolean; error?: string; models?: any[] }>
}

export const AIProviderCard: React.FC<AIProviderCardProps> = ({
  provider,
  onUpdate,
  onValidateApiKey
}) => {
  const [isValidating, setIsValidating] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(provider.apiKey)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleApiKeyChange = (value: string) => {
    setTempApiKey(value)
    setValidationError(null)
    
    // Clear validation status when API key changes
    if (provider.isValidated && value !== provider.apiKey) {
      onUpdate({ isValidated: false, availableModels: [], selectedModel: '' })
    }
  }

  const handleValidateApiKey = async () => {
    if (!tempApiKey.trim()) {
      setValidationError('API key is required')
      return
    }

    setIsValidating(true)
    setValidationError(null)

    try {
      const result = await onValidateApiKey(tempApiKey.trim())
      
      if (!result.isValid) {
        setValidationError(result.error || 'Invalid API key')
      }
    } catch (error) {
      setValidationError('Validation failed. Please check your API key and try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleModelChange = (modelId: string) => {
    onUpdate({ selectedModel: modelId })
  }

  const maskApiKey = (key: string) => {
    if (!key) return ''
    if (key.length <= 8) return '•'.repeat(key.length)
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  const getStatusColor = () => {
    if (isValidating) return 'text-yellow-600'
    if (provider.isValidated) return 'text-green-600'
    if (validationError) return 'text-red-600'
    return 'text-gray-400'
  }

  const getStatusIcon = () => {
    if (isValidating) return '⏳'
    if (provider.isValidated) return '✅'
    if (validationError) return '❌'
    return '⚪'
  }

  const getStatusText = () => {
    if (isValidating) return 'Validating...'
    if (provider.isValidated) return 'Connected'
    if (validationError) return validationError
    return 'Not configured'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-medium"
            style={{ backgroundColor: provider.color }}
          >
            {provider.icon}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
            <p className="text-sm text-gray-500">{provider.description}</p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* API Key Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={`Enter your ${provider.name} API key`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {tempApiKey && (
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              )}
            </div>
            <button
              onClick={handleValidateApiKey}
              disabled={isValidating || !tempApiKey.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </button>
          </div>
          
          {/* Current API Key Display */}
          {provider.apiKey && provider.apiKey !== tempApiKey && (
            <p className="text-xs text-gray-500 mt-1">
              Current: {maskApiKey(provider.apiKey)}
            </p>
          )}
        </div>

        {/* Error Message */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{validationError}</p>
          </div>
        )}

        {/* Model Selection */}
        {provider.isValidated && provider.availableModels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Model
            </label>
            <select
              value={provider.selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a model...</option>
              {provider.availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                  {model.pricing && (
                    ` ($${model.pricing.input}/$${model.pricing.output} per 1K tokens)`
                  )}
                </option>
              ))}
            </select>
            
            {/* Model Info */}
            {provider.selectedModel && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {(() => {
                  const selectedModel = provider.availableModels.find(m => m.id === provider.selectedModel)
                  return selectedModel ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedModel.name}</p>
                      {selectedModel.description && (
                        <p className="text-xs text-gray-600 mt-1">{selectedModel.description}</p>
                      )}
                      {selectedModel.pricing && (
                        <p className="text-xs text-gray-500 mt-1">
                          Input: ${selectedModel.pricing.input}/1K tokens • 
                          Output: ${selectedModel.pricing.output}/1K tokens
                        </p>
                      )}
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {provider.isValidated && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-700">
              ✅ API key validated successfully! 
              {provider.availableModels.length > 0 && (
                <span> Found {provider.availableModels.length} available models.</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
