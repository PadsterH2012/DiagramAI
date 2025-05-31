'use client'

import React, { useState } from 'react'
import { themes, ThemeManager } from '@/utils/theme-system'

interface ThemeSelectorProps {
  onThemeChange?: (themeName: string) => void
  className?: string
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onThemeChange,
  className = ''
}) => {
  const [selectedTheme, setSelectedTheme] = useState('default')

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName)
    ThemeManager.setTheme(themeName)
    onThemeChange?.(themeName)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-700">
        Diagram Theme
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key)}
            className={`
              p-3 border rounded-lg text-left transition-all
              ${selectedTheme === key 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            {/* Theme name */}
            <div className="font-medium text-sm text-gray-900 mb-2">
              {theme.name}
            </div>
            
            {/* Color preview */}
            <div className="flex space-x-1 mb-2">
              <div 
                className="w-4 h-4 rounded-sm border"
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary"
              />
              <div 
                className="w-4 h-4 rounded-sm border"
                style={{ backgroundColor: theme.colors.accent }}
                title="Accent"
              />
              <div 
                className="w-4 h-4 rounded-sm border"
                style={{ backgroundColor: theme.colors.secondary }}
                title="Secondary"
              />
              <div 
                className="w-4 h-4 rounded-sm border"
                style={{ 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }}
                title="Background"
              />
            </div>
            
            {/* Style preview */}
            <div className="text-xs text-gray-600">
              {theme.effects.shadowEnabled && 'Shadow • '}
              {theme.effects.borderRadius > 0 ? 'Rounded' : 'Sharp'} • 
              {theme.typography.fontWeight === 'bold' ? ' Bold' : ' Normal'}
            </div>
          </button>
        ))}
      </div>
      
      {/* Theme description */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <strong>{themes[selectedTheme].name}:</strong>{' '}
        {selectedTheme === 'default' && 'Clean and professional design suitable for most diagrams.'}
        {selectedTheme === 'dark' && 'Dark theme with light text, ideal for presentations and reduced eye strain.'}
        {selectedTheme === 'minimal' && 'Minimalist black and white design with clean lines.'}
        {selectedTheme === 'colorful' && 'Vibrant colors and bold styling for creative and informal diagrams.'}
        {selectedTheme === 'corporate' && 'Conservative styling perfect for business and enterprise use.'}
      </div>
    </div>
  )
}