# AI Settings Module

A comprehensive settings management system for configuring AI provider API keys and model selections in DiagramAI.

## Features

### 🔑 **API Key Management**
- Secure storage with client-side encryption
- Masked display for security
- Real-time validation
- Support for multiple providers

### 🤖 **Supported AI Providers**
- **OpenAI**: GPT-4, GPT-3.5, O1 models
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **OpenRouter**: Access to 100+ models from various providers

### 🔧 **Model Selection**
- Automatic model discovery via API validation
- Model pricing information display
- Context length and capability details
- Smart model recommendations

### 💾 **Backup & Restore**
- Export settings to JSON file
- Import settings from backup
- API keys automatically redacted for security
- Cross-device configuration sync

## Components

### `AISettingsPage`
Main settings page component that orchestrates the entire settings experience.

**Props:** None

**Features:**
- Provider management
- Auto-save functionality
- Status notifications
- Help documentation

### `AIProviderCard`
Individual provider configuration card with API key validation and model selection.

**Props:**
```typescript
interface AIProviderCardProps {
  provider: AIProvider
  onUpdate: (updates: Partial<AIProvider>) => void
  onValidateApiKey: (apiKey: string) => Promise<ValidationResult>
}
```

**Features:**
- API key input with show/hide toggle
- Real-time validation
- Model dropdown with pricing
- Status indicators

### `SettingsImportExport`
Backup and restore functionality for settings.

**Props:**
```typescript
interface SettingsImportExportProps {
  onSettingsImported?: () => void
}
```

**Features:**
- JSON export with redacted API keys
- File import with validation
- Error handling and user feedback

## Services

### `SettingsStorage`
Handles persistent storage of settings with encryption.

**Methods:**
```typescript
class SettingsStorageService {
  async saveSettings(settings: AppSettings): Promise<void>
  async loadSettings(): Promise<AppSettings>
  async clearSettings(): Promise<void>
  async exportSettings(): Promise<string>
  async importSettings(settingsJson: string): Promise<void>
  async hasConfiguredProviders(): Promise<boolean>
  async getDefaultProvider(): Promise<string | null>
}
```

### `AIProviderService`
Validates API keys and fetches available models.

**Methods:**
```typescript
class AIProviderServiceClass {
  async validateApiKey(provider: 'openai' | 'anthropic' | 'openrouter', apiKey: string): Promise<ValidationResult>
  async validateOpenAI(apiKey: string): Promise<ValidationResult>
  async validateAnthropic(apiKey: string): Promise<ValidationResult>
  async validateOpenRouter(apiKey: string): Promise<ValidationResult>
}
```

## Usage

### Basic Setup

1. **Add to Navigation**
```tsx
<a href="/settings" className="nav-link">
  ⚙️ Settings
</a>
```

2. **Create Settings Page**
```tsx
import { AISettingsPage } from '../components/Settings/AISettingsPage'

export default function SettingsPage() {
  return (
    <div className="container">
      <AISettingsPage />
    </div>
  )
}
```

### API Key Configuration

1. Navigate to `/settings`
2. Select an AI provider card
3. Enter your API key
4. Click "Validate" to verify and fetch models
5. Select your preferred model
6. Settings are automatically saved

### Getting API Keys

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **OpenRouter**: [openrouter.ai/keys](https://openrouter.ai/keys)

## Security

### Encryption
- API keys are encrypted using XOR cipher before storage
- Encryption key is application-specific
- Not production-grade but better than plain text

### Data Handling
- API keys never leave the client
- Export function redacts sensitive data
- Validation uses secure HTTPS endpoints
- No server-side storage of credentials

## Testing

Run the test suite:
```bash
npm test -- --testPathPattern=Settings
```

### Test Coverage
- Component rendering
- API key validation
- Settings persistence
- Import/export functionality
- Error handling
- User interactions

## API Endpoints Used

### OpenAI
- `GET https://api.openai.com/v1/models`
- Headers: `Authorization: Bearer {api_key}`

### Anthropic
- `POST https://api.anthropic.com/v1/messages`
- Headers: `x-api-key: {api_key}`, `anthropic-version: 2023-06-01`

### OpenRouter
- `GET https://openrouter.ai/api/v1/models`
- Headers: `Authorization: Bearer {api_key}`

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid API key
- **Network Error**: Connection issues
- **Rate Limiting**: Too many requests
- **Invalid Format**: Malformed import data

### User Feedback
- Real-time validation status
- Clear error messages
- Success confirmations
- Loading indicators

## Customization

### Adding New Providers

1. **Update Provider Interface**
```typescript
type ProviderId = 'openai' | 'anthropic' | 'openrouter' | 'newprovider'
```

2. **Add Validation Logic**
```typescript
async validateNewProvider(apiKey: string): Promise<ValidationResult> {
  // Implementation
}
```

3. **Update Provider List**
```typescript
const providers = [
  // existing providers...
  {
    id: 'newprovider',
    name: 'New Provider',
    description: 'Description',
    icon: '🆕',
    color: '#color'
  }
]
```

### Styling
The components use Tailwind CSS classes and can be customized by:
- Modifying color schemes
- Adjusting spacing and layout
- Adding custom animations
- Implementing dark mode support

## Troubleshooting

### Common Issues

1. **Settings Not Saving**
   - Check localStorage availability
   - Verify browser permissions
   - Clear browser cache

2. **API Validation Failing**
   - Verify API key format
   - Check network connectivity
   - Confirm provider service status

3. **Import/Export Not Working**
   - Ensure file is valid JSON
   - Check file permissions
   - Verify browser file API support

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('diagramai_debug', 'true')
```
