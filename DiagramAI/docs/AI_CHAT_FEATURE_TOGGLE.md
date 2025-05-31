# AI Chat Feature Toggle

This document explains how to enable or disable AI Chat functionality in DiagramAI.

## Current Status

AI Chat functionality is currently **disabled by default** for a cleaner user experience while the feature is being finalized.

## How to Enable AI Chat Features

To enable AI Chat functionality, set the following environment variable:

```bash
NEXT_PUBLIC_ENABLE_AI_CHAT=true
```

### For Development

1. Create a `.env.local` file in the root directory (or update your existing one):
   ```bash
   NEXT_PUBLIC_ENABLE_AI_CHAT=true
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

### For Production

1. Set the environment variable in your deployment environment:
   ```bash
   NEXT_PUBLIC_ENABLE_AI_CHAT=true
   ```

2. Rebuild and deploy your application:
   ```bash
   npm run build
   npm start
   ```

## What Gets Enabled

When `NEXT_PUBLIC_ENABLE_AI_CHAT=true`, the following features become available:

### Visual Editor
- **AI Chat Button**: A "🤖 AI Chat" button appears in the toolbar between the "Delete" and "Properties" buttons
- **Floating Chat Interface**: The MovableChatbox component is rendered, providing a draggable AI assistant

### Settings Page
- **AI Provider Configuration**: Full access to OpenAI, Anthropic, and OpenRouter API configuration
- **API Key Management**: Secure storage and validation of API keys
- **Model Selection**: Choose from available models for each provider

## What Gets Hidden

When `NEXT_PUBLIC_ENABLE_AI_CHAT=false` (default), the following elements are hidden:

### Visual Editor
- AI Chat button is completely removed from the toolbar
- MovableChatbox component is not rendered
- All other functionality remains intact

### Settings Page
- Shows a "Coming Soon" message instead of AI provider cards
- Explains what AI features will be available when ready
- Maintains page structure and navigation

## Technical Implementation

The feature toggle is implemented using:

- **Environment Variable**: `NEXT_PUBLIC_ENABLE_AI_CHAT`
- **Feature Flag Utility**: `src/lib/featureFlags.ts`
- **Conditional Rendering**: Components check `featureFlags.aiChat` before rendering AI-related UI

## Testing

Both enabled and disabled states are covered by unit tests:

```bash
# Run AI Settings tests
npm test -- --testPathPattern="Settings"

# Run DiagramEditor tests 
npm test -- --testPathPattern="DiagramEditor"
```

## Support

When AI features are fully ready and tested:

1. Update the default value in `.env.example`
2. Update this documentation
3. Announce the feature availability to users

## Troubleshooting

If AI features aren't appearing after enabling:

1. Verify the environment variable is set correctly
2. Ensure you've restarted your development server
3. Check browser console for any JavaScript errors
4. Clear browser cache if necessary