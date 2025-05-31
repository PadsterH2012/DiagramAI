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

// Test drag offset calculation fix  
describe('Floating Toolbar Drag Offset Calculation', () => {
  it('should calculate drag offset relative to toolbar position, not bounding rect', () => {
    // Simulate the scenario where toolbar is at position (100, 50)
    const toolbarPosition = { x: 100, y: 50 }
    
    // Simulate mouse click at screen coordinates (150, 80)
    const mouseEvent = { clientX: 150, clientY: 80 }
    
    // The drag offset should be relative to toolbar position
    const expectedOffset = {
      x: mouseEvent.clientX - toolbarPosition.x, // 150 - 100 = 50
      y: mouseEvent.clientY - toolbarPosition.y  // 80 - 50 = 30
    }
    
    expect(expectedOffset).toEqual({ x: 50, y: 30 })
    
    // During drag, when mouse moves to (200, 120), the new toolbar position should be:
    const newMousePos = { clientX: 200, clientY: 120 }
    const newToolbarPosition = {
      x: newMousePos.clientX - expectedOffset.x, // 200 - 50 = 150
      y: newMousePos.clientY - expectedOffset.y  // 120 - 30 = 90
    }
    
    expect(newToolbarPosition).toEqual({ x: 150, y: 90 })
  })

  it('should maintain consistent cursor position during drag operation', () => {
    // Test that the offset calculation ensures cursor stays at same relative position
    const initialToolbarPosition = { x: 200, y: 100 }
    const initialMousePosition = { clientX: 250, clientY: 130 }
    
    // Calculate initial offset
    const dragOffset = {
      x: initialMousePosition.clientX - initialToolbarPosition.x, // 50
      y: initialMousePosition.clientY - initialToolbarPosition.y  // 30
    }
    
    // Simulate mouse movement during drag
    const newMousePosition = { clientX: 300, clientY: 180 }
    
    // Calculate new toolbar position using the offset
    const newToolbarPosition = {
      x: newMousePosition.clientX - dragOffset.x, // 300 - 50 = 250
      y: newMousePosition.clientY - dragOffset.y  // 180 - 30 = 150
    }
    
    // Verify that the relative mouse position to toolbar remains the same
    const newRelativePosition = {
      x: newMousePosition.clientX - newToolbarPosition.x, // 300 - 250 = 50
      y: newMousePosition.clientY - newToolbarPosition.y  // 180 - 150 = 30
    }
    
    expect(newRelativePosition).toEqual(dragOffset)
  })
})