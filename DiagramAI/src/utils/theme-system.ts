/**
 * Theme System for DiagramAI Nodes
 * Provides consistent styling and theming across all node types
 */

import { NodeTheme } from '@/types/node-definitions'

// Built-in themes
export const themes: Record<string, NodeTheme> = {
  default: {
    name: 'Default',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#ffffff',
      text: '#374151',
      border: '#d1d5db'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      fontWeight: 'normal'
    },
    effects: {
      shadowEnabled: true,
      borderRadius: 6,
      borderWidth: 2
    }
  },
  
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      accent: '#34d399',
      background: '#1f2937',
      text: '#f9fafb',
      border: '#374151'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      fontWeight: 'normal'
    },
    effects: {
      shadowEnabled: true,
      borderRadius: 6,
      borderWidth: 2
    }
  },
  
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#6b7280',
      accent: '#000000',
      background: '#ffffff',
      text: '#000000',
      border: '#000000'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 12,
      fontWeight: 'normal'
    },
    effects: {
      shadowEnabled: false,
      borderRadius: 0,
      borderWidth: 1
    }
  },
  
  colorful: {
    name: 'Colorful',
    colors: {
      primary: '#8b5cf6',
      secondary: '#f59e0b',
      accent: '#ef4444',
      background: '#fef3c7',
      text: '#374151',
      border: '#d1d5db'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      fontWeight: 'bold'
    },
    effects: {
      shadowEnabled: true,
      borderRadius: 12,
      borderWidth: 3
    }
  },
  
  corporate: {
    name: 'Corporate',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#0f766e',
      background: '#f8fafc',
      text: '#1e293b',
      border: '#cbd5e1'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 13,
      fontWeight: 'normal'
    },
    effects: {
      shadowEnabled: true,
      borderRadius: 4,
      borderWidth: 1
    }
  }
}

// Color schemes for different node categories
export const categoryColorSchemes = {
  basic: {
    start: '#10b981',
    process: '#3b82f6', 
    decision: '#f59e0b',
    end: '#ef4444'
  },
  flowchart: {
    input: '#8b5cf6',
    output: '#06b6d4',
    database: '#84cc16',
    document: '#f97316'
  },
  network: {
    server: '#6366f1',
    router: '#059669',
    cloud: '#14b8a6',
    api: '#ec4899'
  },
  system: {
    user: '#f59e0b',
    service: '#7c3aed',
    datastore: '#16a34a',
    external: '#dc2626'
  }
}

// Helper functions for theme application
export class ThemeManager {
  private static currentTheme: NodeTheme = themes.default

  static setTheme(themeName: string): void {
    if (themes[themeName]) {
      this.currentTheme = themes[themeName]
    }
  }

  static getCurrentTheme(): NodeTheme {
    return this.currentTheme
  }

  static getThemeNames(): string[] {
    return Object.keys(themes)
  }

  static applyThemeToNodeStyle(nodeType: string, category: string = 'basic') {
    const theme = this.currentTheme
    const categoryColors = categoryColorSchemes[category as keyof typeof categoryColorSchemes]
    const nodeColor = categoryColors?.[nodeType as keyof typeof categoryColors] || theme.colors.primary

    return {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      textColor: theme.colors.text,
      accentColor: nodeColor,
      borderWidth: theme.effects.borderWidth,
      borderRadius: theme.effects.borderRadius,
      fontSize: theme.typography.fontSize,
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeight,
      shadowEnabled: theme.effects.shadowEnabled
    }
  }

  static getConnectionStyle() {
    const theme = this.currentTheme
    return {
      stroke: theme.colors.border,
      strokeWidth: 2,
      markerEnd: {
        type: 'arrow' as const,
        color: theme.colors.border
      }
    }
  }

  static getCSSVariables(): Record<string, string> {
    const theme = this.currentTheme
    return {
      '--theme-primary': theme.colors.primary,
      '--theme-secondary': theme.colors.secondary,
      '--theme-accent': theme.colors.accent,
      '--theme-background': theme.colors.background,
      '--theme-text': theme.colors.text,
      '--theme-border': theme.colors.border,
      '--theme-font-family': theme.typography.fontFamily,
      '--theme-font-size': `${theme.typography.fontSize}px`,
      '--theme-font-weight': theme.typography.fontWeight,
      '--theme-border-radius': `${theme.effects.borderRadius}px`,
      '--theme-border-width': `${theme.effects.borderWidth}px`
    }
  }
}

// Pre-configured node styles for each category
export const getNodeStylePresets = (category: string) => {
  const theme = ThemeManager.getCurrentTheme()
  const colors = categoryColorSchemes[category as keyof typeof categoryColorSchemes]
  
  if (!colors) return {}
  
  return Object.keys(colors).reduce((acc, nodeType) => {
    acc[nodeType] = ThemeManager.applyThemeToNodeStyle(nodeType, category)
    return acc
  }, {} as Record<string, any>)
}