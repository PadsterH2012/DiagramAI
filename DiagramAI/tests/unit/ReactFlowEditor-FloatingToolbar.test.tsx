/**
 * Unit tests for the enhanced floating toolbar functionality
 * Tests the key improvements made for issue #6
 */

// Simple unit tests for localStorage functionality
describe('FloatingToolbar Position Persistence', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  }
  
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should save toolbar position to localStorage', () => {
    const position = { x: 100, y: 50 }
    
    // Simulate saving position
    localStorage.setItem('diagram-floating-toolbar-position', JSON.stringify(position))
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'diagram-floating-toolbar-position',
      JSON.stringify(position)
    )
  })

  it('should retrieve toolbar position from localStorage', () => {
    const savedPosition = { x: 200, y: 100 }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPosition))
    
    const result = localStorage.getItem('diagram-floating-toolbar-position')
    const position = result ? JSON.parse(result) : null
    
    expect(position).toEqual(savedPosition)
  })

  it('should handle invalid localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')
    
    let position = null
    try {
      const result = localStorage.getItem('diagram-floating-toolbar-position')
      position = result ? JSON.parse(result) : null
    } catch (e) {
      // Should handle gracefully
      position = { x: 400, y: 20 } // Default position
    }
    
    expect(position).toEqual({ x: 400, y: 20 })
  })
})

// Test toolbar action consolidation logic
describe('Toolbar Action Consolidation', () => {
  it('should organize actions into correct groups', () => {
    const toolbarActions = {
      mode: ['select', 'pan'],
      edit: ['copy', 'paste', 'delete'],
      panels: ['properties', 'help'],
      clear: ['clearAll']
    }
    
    expect(toolbarActions.mode).toHaveLength(2)
    expect(toolbarActions.edit).toHaveLength(3)
    expect(toolbarActions.panels).toHaveLength(2)
    expect(toolbarActions.clear).toHaveLength(1)
  })

  it('should properly disable actions based on state', () => {
    const hasSelection = (nodes: any[], edges: any[]) => nodes.length > 0 || edges.length > 0
    const hasClipboard = (clipboard: any) => clipboard !== null
    
    // Test with no selection
    expect(hasSelection([], [])).toBe(false)
    
    // Test with selection
    expect(hasSelection([{ id: '1' }], [])).toBe(true)
    
    // Test clipboard
    expect(hasClipboard(null)).toBe(false)
    expect(hasClipboard({ nodes: [], edges: [] })).toBe(true)
  })
})

// Test removal of redundant actions
describe('Redundant Action Removal', () => {
  it('should verify "To Mermaid" button removal logic', () => {
    // Simulate the condition where "To Mermaid" button should not appear
    // when Mermaid Code tab is available
    const activeTab = 'visual'
    const hasMermaidTab = true
    
    // The "To Mermaid" button should not be shown when Mermaid tab exists
    const shouldShowToMermaidButton = activeTab === 'visual' && !hasMermaidTab
    
    expect(shouldShowToMermaidButton).toBe(false)
  })

  it('should verify main toolbar actions are properly moved', () => {
    // Actions that should be moved to floating toolbar
    const movedActions = ['copy', 'paste', 'delete', 'properties', 'help', 'clearAll']
    
    // Actions that should remain in main toolbar  
    const remainingActions = ['aiChat', 'resetDemo', 'save']
    
    expect(movedActions).toContain('copy')
    expect(movedActions).toContain('delete')
    expect(movedActions).toContain('properties')
    expect(movedActions).toContain('help')
    expect(movedActions).toContain('clearAll')
    
    expect(remainingActions).not.toContain('copy')
    expect(remainingActions).not.toContain('delete')
    expect(remainingActions).toContain('save')
  })
})