'use client'

export interface ModelInfo {
  id: string
  name: string
  description?: string
  pricing?: {
    input: number
    output: number
  }
  context_length?: number
  owned_by?: string
}

export interface ValidationResult {
  isValid: boolean
  error?: string
  models?: ModelInfo[]
}

class AIProviderServiceClass {
  
  // OpenAI API validation and model fetching
  async validateOpenAI(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          return { isValid: false, error: 'Invalid API key' }
        }
        return { isValid: false, error: `API error: ${response.status}` }
      }

      const data = await response.json()
      
      // Filter and format models
      const models: ModelInfo[] = data.data
        .filter((model: any) => 
          model.id.includes('gpt') || 
          model.id.includes('text-') || 
          model.id.includes('davinci') ||
          model.id.includes('o1')
        )
        .map((model: any) => ({
          id: model.id,
          name: this.formatModelName(model.id),
          description: this.getOpenAIModelDescription(model.id),
          owned_by: model.owned_by,
          pricing: this.getOpenAIModelPricing(model.id)
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      return {
        isValid: true,
        models
      }
    } catch (error) {
      console.error('OpenAI validation error:', error)
      return { 
        isValid: false, 
        error: 'Network error. Please check your connection and try again.' 
      }
    }
  }

  // Anthropic API validation (no public models endpoint, so we use known models)
  async validateAnthropic(apiKey: string): Promise<ValidationResult> {
    try {
      // Test API key with a simple request
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      })

      if (response.status === 401) {
        return { isValid: false, error: 'Invalid API key' }
      }

      if (response.status === 400) {
        // This is expected for our test request, means API key is valid
        const models: ModelInfo[] = [
          {
            id: 'claude-3-5-sonnet-20241022',
            name: 'Claude 3.5 Sonnet',
            description: 'Most intelligent model, ideal for complex tasks',
            pricing: { input: 3.00, output: 15.00 }
          },
          {
            id: 'claude-3-5-haiku-20241022',
            name: 'Claude 3.5 Haiku',
            description: 'Fastest model, great for simple tasks',
            pricing: { input: 0.25, output: 1.25 }
          },
          {
            id: 'claude-3-opus-20240229',
            name: 'Claude 3 Opus',
            description: 'Most powerful model for highly complex tasks',
            pricing: { input: 15.00, output: 75.00 }
          },
          {
            id: 'claude-3-sonnet-20240229',
            name: 'Claude 3 Sonnet',
            description: 'Balanced performance and speed',
            pricing: { input: 3.00, output: 15.00 }
          },
          {
            id: 'claude-3-haiku-20240307',
            name: 'Claude 3 Haiku',
            description: 'Fast and cost-effective',
            pricing: { input: 0.25, output: 1.25 }
          }
        ]

        return {
          isValid: true,
          models
        }
      }

      return { isValid: false, error: `Unexpected response: ${response.status}` }
    } catch (error) {
      console.error('Anthropic validation error:', error)
      return { 
        isValid: false, 
        error: 'Network error. Please check your connection and try again.' 
      }
    }
  }

  // OpenRouter API validation and model fetching
  async validateOpenRouter(apiKey: string): Promise<ValidationResult> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          return { isValid: false, error: 'Invalid API key' }
        }
        return { isValid: false, error: `API error: ${response.status}` }
      }

      const data = await response.json()
      
      // Format OpenRouter models
      const models: ModelInfo[] = data.data
        .filter((model: any) => model.id && model.name)
        .map((model: any) => ({
          id: model.id,
          name: model.name,
          description: model.description || '',
          context_length: model.context_length,
          pricing: model.pricing ? {
            input: parseFloat(model.pricing.prompt) * 1000000, // Convert to per 1M tokens
            output: parseFloat(model.pricing.completion) * 1000000
          } : undefined
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      return {
        isValid: true,
        models: models.slice(0, 50) // Limit to first 50 models for performance
      }
    } catch (error) {
      console.error('OpenRouter validation error:', error)
      return { 
        isValid: false, 
        error: 'Network error. Please check your connection and try again.' 
      }
    }
  }

  // Main validation method
  async validateApiKey(provider: 'openai' | 'anthropic' | 'openrouter', apiKey: string): Promise<ValidationResult> {
    switch (provider) {
      case 'openai':
        return this.validateOpenAI(apiKey)
      case 'anthropic':
        return this.validateAnthropic(apiKey)
      case 'openrouter':
        return this.validateOpenRouter(apiKey)
      default:
        return { isValid: false, error: 'Unknown provider' }
    }
  }

  // Helper methods
  private formatModelName(modelId: string): string {
    return modelId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Gpt/g, 'GPT')
      .replace(/Text/g, 'Text')
  }

  private getOpenAIModelDescription(modelId: string): string {
    const descriptions: Record<string, string> = {
      'gpt-4o': 'Most advanced multimodal model',
      'gpt-4o-mini': 'Affordable and intelligent small model',
      'gpt-4-turbo': 'Latest GPT-4 model with improved performance',
      'gpt-4': 'More capable than GPT-3.5, able to do more complex tasks',
      'gpt-3.5-turbo': 'Most capable GPT-3.5 model, optimized for chat',
      'o1-preview': 'Reasoning model designed for complex problem-solving',
      'o1-mini': 'Faster and cheaper reasoning model'
    }
    
    return descriptions[modelId] || 'OpenAI language model'
  }

  private getOpenAIModelPricing(modelId: string): { input: number; output: number } | undefined {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 5.00, output: 15.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
      'o1-preview': { input: 15.00, output: 60.00 },
      'o1-mini': { input: 3.00, output: 12.00 }
    }
    
    return pricing[modelId]
  }
}

export const AIProviderService = new AIProviderServiceClass()
