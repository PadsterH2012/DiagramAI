import React from 'react'
import { Metadata } from 'next'
import { AISettingsPage } from '../../src/components/Settings/AISettingsPage'

export const metadata: Metadata = {
  title: 'AI Settings - DiagramAI',
  description: 'Configure AI provider settings and API keys for DiagramAI',
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-5">
            <h1 className="text-3xl font-bold leading-6 text-gray-900">
              AI Provider Settings
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Configure your API keys and model preferences for OpenAI, Anthropic, and OpenRouter. 
              Your API keys are stored securely and never shared.
            </p>
          </div>
        </div>

        {/* Settings Content */}
        <div className="px-4 sm:px-0">
          <AISettingsPage />
        </div>
      </div>
    </div>
  )
}
