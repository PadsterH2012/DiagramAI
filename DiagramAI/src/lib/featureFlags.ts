/**
 * Feature flag utilities for controlling application features
 */

/**
 * Check if AI chat functionality should be enabled
 * @returns true if AI chat features should be shown, false otherwise
 */
export const isAIChatEnabled = (): boolean => {
  // Check environment variable, default to false (disabled) for safety
  return process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === 'true'
}

/**
 * Feature flags object for easy access
 */
export const featureFlags = {
  aiChat: isAIChatEnabled(),
} as const