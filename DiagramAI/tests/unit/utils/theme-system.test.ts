import { ThemeManager, themes, categoryColorSchemes, getNodeStylePresets } from '@/utils/theme-system'

describe('Theme System', () => {
  beforeEach(() => {
    // Reset to default theme before each test
    ThemeManager.setTheme('default')
  })

  describe('ThemeManager', () => {
    it('should set and get themes correctly', () => {
      ThemeManager.setTheme('dark')
      const currentTheme = ThemeManager.getCurrentTheme()
      expect(currentTheme.name).toBe('Dark')
    })

    it('should handle invalid theme names gracefully', () => {
      const originalTheme = ThemeManager.getCurrentTheme()
      ThemeManager.setTheme('nonexistent')
      const currentTheme = ThemeManager.getCurrentTheme()
      expect(currentTheme).toBe(originalTheme) // Should not change
    })

    it('should return all available theme names', () => {
      const themeNames = ThemeManager.getThemeNames()
      expect(themeNames).toContain('default')
      expect(themeNames).toContain('dark')
      expect(themeNames).toContain('minimal')
      expect(themeNames).toContain('colorful')
      expect(themeNames).toContain('corporate')
    })

    it('should apply theme to node styles correctly', () => {
      ThemeManager.setTheme('dark')
      const nodeStyle = ThemeManager.applyThemeToNodeStyle('process', 'basic')
      
      expect(nodeStyle.backgroundColor).toBe('#1f2937') // Dark theme background
      expect(nodeStyle.textColor).toBe('#f9fafb') // Dark theme text
      expect(nodeStyle.accentColor).toBe('#3b82f6') // Process color from basic category
    })

    it('should generate connection styles based on theme', () => {
      ThemeManager.setTheme('minimal')
      const connectionStyle = ThemeManager.getConnectionStyle()
      
      expect(connectionStyle.stroke).toBe('#000000') // Minimal theme border
      expect(connectionStyle.strokeWidth).toBe(2)
      expect(connectionStyle.markerEnd.type).toBe('arrow')
    })

    it('should generate CSS variables for theme', () => {
      ThemeManager.setTheme('colorful')
      const cssVars = ThemeManager.getCSSVariables()
      
      expect(cssVars['--theme-primary']).toBe('#8b5cf6')
      expect(cssVars['--theme-font-size']).toBe('14px')
      expect(cssVars['--theme-border-radius']).toBe('12px')
    })
  })

  describe('Built-in Themes', () => {
    it('should have all required theme properties', () => {
      Object.values(themes).forEach(theme => {
        expect(theme).toHaveProperty('name')
        expect(theme).toHaveProperty('colors')
        expect(theme).toHaveProperty('typography')
        expect(theme).toHaveProperty('effects')
        
        // Check colors object
        expect(theme.colors).toHaveProperty('primary')
        expect(theme.colors).toHaveProperty('secondary')
        expect(theme.colors).toHaveProperty('accent')
        expect(theme.colors).toHaveProperty('background')
        expect(theme.colors).toHaveProperty('text')
        expect(theme.colors).toHaveProperty('border')
        
        // Check typography object
        expect(theme.typography).toHaveProperty('fontFamily')
        expect(theme.typography).toHaveProperty('fontSize')
        expect(theme.typography).toHaveProperty('fontWeight')
        
        // Check effects object
        expect(theme.effects).toHaveProperty('shadowEnabled')
        expect(theme.effects).toHaveProperty('borderRadius')
        expect(theme.effects).toHaveProperty('borderWidth')
      })
    })

    it('should have unique theme names', () => {
      const themeNames = Object.values(themes).map(theme => theme.name)
      const uniqueNames = [...new Set(themeNames)]
      expect(themeNames.length).toBe(uniqueNames.length)
    })

    it('should have valid color values', () => {
      Object.values(themes).forEach(theme => {
        Object.values(theme.colors).forEach(color => {
          expect(color).toMatch(/^#[0-9a-fA-F]{6}$/) // Valid hex color
        })
      })
    })
  })

  describe('Category Color Schemes', () => {
    it('should have colors for all main categories', () => {
      expect(categoryColorSchemes).toHaveProperty('basic')
      expect(categoryColorSchemes).toHaveProperty('flowchart')
      expect(categoryColorSchemes).toHaveProperty('network')
      expect(categoryColorSchemes).toHaveProperty('system')
    })

    it('should have valid colors in each category', () => {
      Object.values(categoryColorSchemes).forEach(category => {
        Object.values(category).forEach(color => {
          expect(color).toMatch(/^#[0-9a-fA-F]{6}$/) // Valid hex color
        })
      })
    })

    it('should generate node style presets for categories', () => {
      const basicPresets = getNodeStylePresets('basic')
      
      expect(basicPresets).toHaveProperty('start')
      expect(basicPresets).toHaveProperty('process')
      expect(basicPresets).toHaveProperty('decision')
      expect(basicPresets).toHaveProperty('end')
      
      // Check that each preset has required style properties
      Object.values(basicPresets).forEach(preset => {
        expect(preset).toHaveProperty('backgroundColor')
        expect(preset).toHaveProperty('borderColor')
        expect(preset).toHaveProperty('textColor')
        expect(preset).toHaveProperty('accentColor')
      })
    })
  })

  describe('Theme Application', () => {
    it('should apply different themes to same node type differently', () => {
      // Apply default theme
      ThemeManager.setTheme('default')
      const defaultStyle = ThemeManager.applyThemeToNodeStyle('process', 'basic')
      
      // Apply dark theme
      ThemeManager.setTheme('dark')
      const darkStyle = ThemeManager.applyThemeToNodeStyle('process', 'basic')
      
      expect(defaultStyle.backgroundColor).not.toBe(darkStyle.backgroundColor)
      expect(defaultStyle.textColor).not.toBe(darkStyle.textColor)
    })

    it('should maintain consistent accent colors across themes for same node type', () => {
      ThemeManager.setTheme('default')
      const defaultStyle = ThemeManager.applyThemeToNodeStyle('start', 'basic')
      
      ThemeManager.setTheme('dark')
      const darkStyle = ThemeManager.applyThemeToNodeStyle('start', 'basic')
      
      // Accent color should be the same (start node color)
      expect(defaultStyle.accentColor).toBe(darkStyle.accentColor)
    })

    it('should handle unknown categories gracefully', () => {
      const unknownStyle = ThemeManager.applyThemeToNodeStyle('unknown', 'nonexistent')
      expect(unknownStyle.accentColor).toBe(themes.default.colors.primary)
    })
  })
})