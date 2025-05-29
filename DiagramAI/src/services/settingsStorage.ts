'use client'

export interface AIProviderSettings {
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

export interface AppSettings {
  providers: {
    openai?: AIProviderSettings
    anthropic?: AIProviderSettings
    openrouter?: AIProviderSettings
  }
  preferences?: {
    defaultProvider?: 'openai' | 'anthropic' | 'openrouter'
    theme?: 'light' | 'dark' | 'system'
    autoSave?: boolean
  }
  lastUpdated?: string
}

class SettingsStorageService {
  private readonly STORAGE_KEY = 'diagramai_settings'
  private readonly ENCRYPTION_KEY = 'diagramai_encryption_key_v1'

  // Simple encryption for API keys (not production-grade, but better than plain text)
  private encrypt(text: string): string {
    try {
      // Simple XOR encryption with base64 encoding
      const key = this.ENCRYPTION_KEY
      let encrypted = ''
      for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
      }
      return btoa(encrypted)
    } catch (error) {
      console.warn('Encryption failed, storing as plain text:', error)
      return text
    }
  }

  private decrypt(encryptedText: string): string {
    try {
      // Reverse the XOR encryption
      const key = this.ENCRYPTION_KEY
      const encrypted = atob(encryptedText)
      let decrypted = ''
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length))
      }
      return decrypted
    } catch (error) {
      console.warn('Decryption failed, returning as-is:', error)
      return encryptedText
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      // Encrypt API keys before storing
      const encryptedSettings: AppSettings = {
        ...settings,
        providers: {},
        lastUpdated: new Date().toISOString()
      }

      // Encrypt each provider's API key
      Object.entries(settings.providers).forEach(([providerId, providerSettings]) => {
        if (providerSettings) {
          encryptedSettings.providers[providerId as keyof typeof encryptedSettings.providers] = {
            ...providerSettings,
            apiKey: providerSettings.apiKey ? this.encrypt(providerSettings.apiKey) : ''
          }
        }
      })

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encryptedSettings))
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw new Error('Failed to save settings to local storage')
    }
  }

  async loadSettings(): Promise<AppSettings> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return { providers: {} }
      }

      const encryptedSettings: AppSettings = JSON.parse(stored)
      
      // Decrypt API keys
      const decryptedSettings: AppSettings = {
        ...encryptedSettings,
        providers: {}
      }

      Object.entries(encryptedSettings.providers).forEach(([providerId, providerSettings]) => {
        if (providerSettings) {
          decryptedSettings.providers[providerId as keyof typeof decryptedSettings.providers] = {
            ...providerSettings,
            apiKey: providerSettings.apiKey ? this.decrypt(providerSettings.apiKey) : ''
          }
        }
      })

      return decryptedSettings
    } catch (error) {
      console.error('Failed to load settings:', error)
      return { providers: {} }
    }
  }

  async clearSettings(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear settings:', error)
      throw new Error('Failed to clear settings from local storage')
    }
  }

  async exportSettings(): Promise<string> {
    try {
      const settings = await this.loadSettings()
      
      // Remove sensitive data for export
      const exportData = {
        ...settings,
        providers: Object.fromEntries(
          Object.entries(settings.providers).map(([providerId, providerSettings]) => [
            providerId,
            providerSettings ? {
              ...providerSettings,
              apiKey: providerSettings.apiKey ? '***REDACTED***' : '',
              isValidated: false // Reset validation status
            } : null
          ])
        )
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Failed to export settings:', error)
      throw new Error('Failed to export settings')
    }
  }

  async importSettings(settingsJson: string): Promise<void> {
    try {
      const importedSettings: AppSettings = JSON.parse(settingsJson)
      
      // Validate the structure
      if (!importedSettings.providers || typeof importedSettings.providers !== 'object') {
        throw new Error('Invalid settings format')
      }

      // Merge with existing settings, but don't overwrite API keys
      const existingSettings = await this.loadSettings()
      
      const mergedSettings: AppSettings = {
        ...importedSettings,
        providers: {}
      }

      // Merge provider settings
      Object.entries(importedSettings.providers).forEach(([providerId, providerSettings]) => {
        if (providerSettings) {
          const existingProvider = existingSettings.providers[providerId as keyof typeof existingSettings.providers]
          
          mergedSettings.providers[providerId as keyof typeof mergedSettings.providers] = {
            ...providerSettings,
            // Keep existing API key if the imported one is redacted
            apiKey: providerSettings.apiKey === '***REDACTED***' 
              ? (existingProvider?.apiKey || '') 
              : providerSettings.apiKey,
            // Reset validation status for security
            isValidated: false,
            availableModels: []
          }
        }
      })

      await this.saveSettings(mergedSettings)
    } catch (error) {
      console.error('Failed to import settings:', error)
      throw new Error('Failed to import settings. Please check the format and try again.')
    }
  }

  // Utility method to check if any provider is configured
  async hasConfiguredProviders(): Promise<boolean> {
    try {
      const settings = await this.loadSettings()
      return Object.values(settings.providers).some(provider => 
        provider && provider.apiKey && provider.isValidated
      )
    } catch (error) {
      console.error('Failed to check configured providers:', error)
      return false
    }
  }

  // Get the default or preferred provider
  async getDefaultProvider(): Promise<string | null> {
    try {
      const settings = await this.loadSettings()
      
      // Return user's preferred provider if set and configured
      if (settings.preferences?.defaultProvider) {
        const preferredProvider = settings.providers[settings.preferences.defaultProvider]
        if (preferredProvider?.isValidated) {
          return settings.preferences.defaultProvider
        }
      }

      // Otherwise, return the first configured provider
      const configuredProvider = Object.entries(settings.providers).find(([_, provider]) => 
        provider && provider.isValidated
      )

      return configuredProvider ? configuredProvider[0] : null
    } catch (error) {
      console.error('Failed to get default provider:', error)
      return null
    }
  }
}

export const SettingsStorage = new SettingsStorageService()
