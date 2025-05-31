import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AISettingsPage } from '../AISettingsPage'
import { SettingsStorage } from '../../../services/settingsStorage'
import { AIProviderService } from '../../../services/aiProviderService'

// Mock the services
jest.mock('../../../services/settingsStorage')
jest.mock('../../../services/aiProviderService')

// Mock the feature flags
let mockAIChatEnabled = true
jest.mock('../../../lib/featureFlags', () => ({
  featureFlags: {
    get aiChat() { return mockAIChatEnabled }
  }
}))

const mockSettingsStorage = SettingsStorage as jest.Mocked<typeof SettingsStorage>
const mockAIProviderService = AIProviderService as jest.Mocked<typeof AIProviderService>

describe('AISettingsPage', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })

    // Default mock implementations
    mockSettingsStorage.loadSettings.mockResolvedValue({
      providers: {}
    })
    
    mockSettingsStorage.saveSettings.mockResolvedValue()
    mockSettingsStorage.clearSettings.mockResolvedValue()
  })

  describe('when AI chat is disabled', () => {
    beforeEach(() => {
      mockAIChatEnabled = false
    })

    it('shows coming soon message', async () => {
      render(<AISettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('AI Chat Features Coming Soon')).toBeInTheDocument()
        expect(screen.getByText(/We're working hard to bring you AI-powered diagram assistance/)).toBeInTheDocument()
      })
    })

    it('does not show AI provider cards', async () => {
      render(<AISettingsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('AI Chat Features Coming Soon')).toBeInTheDocument()
      })

      expect(screen.queryByText('OpenAI')).not.toBeInTheDocument()
      expect(screen.queryByText('Anthropic')).not.toBeInTheDocument()
      expect(screen.queryByText('OpenRouter')).not.toBeInTheDocument()
    })
  })

  describe('when AI chat is enabled', () => {
    beforeEach(() => {
      mockAIChatEnabled = true
    })

  it('renders all AI provider cards', async () => {
    render(<AISettingsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument()
      expect(screen.getByText('Anthropic')).toBeInTheDocument()
      expect(screen.getByText('OpenRouter')).toBeInTheDocument()
    })
  })

  it('loads settings on mount', async () => {
    const mockSettings = {
      providers: {
        openai: {
          apiKey: 'test-key',
          selectedModel: 'gpt-4',
          isValidated: true,
          availableModels: [
            { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' }
          ]
        }
      }
    }

    mockSettingsStorage.loadSettings.mockResolvedValue(mockSettings)

    render(<AISettingsPage />)

    await waitFor(() => {
      expect(mockSettingsStorage.loadSettings).toHaveBeenCalled()
    })
  })

  it('validates API key when validate button is clicked', async () => {
    mockAIProviderService.validateApiKey.mockResolvedValue({
      isValid: true,
      models: [
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' }
      ]
    })

    render(<AISettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument()
    })

    // Find the first API key input (OpenAI)
    const apiKeyInputs = screen.getAllByPlaceholderText(/Enter your .* API key/)
    const openaiInput = apiKeyInputs[0]
    
    // Enter API key
    fireEvent.change(openaiInput, { target: { value: 'test-api-key' } })

    // Click validate button
    const validateButtons = screen.getAllByText('Validate')
    fireEvent.click(validateButtons[0])

    await waitFor(() => {
      expect(mockAIProviderService.validateApiKey).toHaveBeenCalledWith('openai', 'test-api-key')
    })
  })

  it('shows error message for invalid API key', async () => {
    mockAIProviderService.validateApiKey.mockResolvedValue({
      isValid: false,
      error: 'Invalid API key'
    })

    render(<AISettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument()
    })

    // Find the first API key input (OpenAI)
    const apiKeyInputs = screen.getAllByPlaceholderText(/Enter your .* API key/)
    const openaiInput = apiKeyInputs[0]
    
    // Enter invalid API key
    fireEvent.change(openaiInput, { target: { value: 'invalid-key' } })

    // Click validate button
    const validateButtons = screen.getAllByText('Validate')
    fireEvent.click(validateButtons[0])

    await waitFor(() => {
      // Use getAllByText since "Invalid API key" appears in both status indicator and error message
      const invalidKeyElements = screen.getAllByText('Invalid API key')
      expect(invalidKeyElements.length).toBeGreaterThan(0)
    })
  })

  it('saves settings automatically when provider is updated', async () => {
    render(<AISettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument()
    })

    // Simulate successful validation
    mockAIProviderService.validateApiKey.mockResolvedValue({
      isValid: true,
      models: [
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' }
      ]
    })

    // Find the first API key input (OpenAI)
    const apiKeyInputs = screen.getAllByPlaceholderText(/Enter your .* API key/)
    const openaiInput = apiKeyInputs[0]
    
    // Enter API key
    fireEvent.change(openaiInput, { target: { value: 'test-api-key' } })

    // Click validate button
    const validateButtons = screen.getAllByText('Validate')
    fireEvent.click(validateButtons[0])

    await waitFor(() => {
      expect(mockSettingsStorage.saveSettings).toHaveBeenCalled()
    })
  })

  it('clears all settings when clear button is clicked', async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true)

    render(<AISettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Clear All Settings')).toBeInTheDocument()
    })

    // Click clear all settings button
    fireEvent.click(screen.getByText('Clear All Settings'))

    await waitFor(() => {
      expect(mockSettingsStorage.clearSettings).toHaveBeenCalled()
      expect(mockSettingsStorage.loadSettings).toHaveBeenCalledTimes(2) // Once on mount, once after clear
    })
  })

  it('shows loading state initially', () => {
    render(<AISettingsPage />)
    
    expect(screen.getByText('Loading settings...')).toBeInTheDocument()
  })

  it('shows save status messages', async () => {
    // Mock a slow save operation to catch the saving state
    mockSettingsStorage.saveSettings.mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<AISettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument()
    })

    // Simulate a successful validation that triggers save
    mockAIProviderService.validateApiKey.mockResolvedValue({
      isValid: true,
      models: [
        { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' }
      ]
    })

    const apiKeyInputs = screen.getAllByPlaceholderText(/Enter your .* API key/)
    const openaiInput = apiKeyInputs[0]

    fireEvent.change(openaiInput, { target: { value: 'test-key' } })

    const validateButtons = screen.getAllByText('Validate')
    fireEvent.click(validateButtons[0])

    // Should eventually show saved status (since saving is fast, we check for the success message)
    await waitFor(() => {
      expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument()
    })
  })

  it('displays help section with provider links', async () => {
    render(<AISettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('💡 Getting Started')).toBeInTheDocument()
      expect(screen.getByText(/platform.openai.com/)).toBeInTheDocument()
      expect(screen.getByText(/console.anthropic.com/)).toBeInTheDocument()
      expect(screen.getByText(/openrouter.ai/)).toBeInTheDocument()
    })
  })
  }) // End of 'when AI chat is enabled' describe block
})
