/**
 * Unit tests for the Clear All functionality in MermaidEditor
 * Tests the clear button behavior for issue #25 in Mermaid mode
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MermaidEditor } from '../../../src/components/DiagramEditor/MermaidEditor'

// Mock confirm function
const originalConfirm = window.confirm
beforeEach(() => {
  window.confirm = jest.fn()
})

afterEach(() => {
  window.confirm = originalConfirm
  jest.clearAllMocks()
})

// Mock mermaid import
jest.mock('mermaid', () => ({
  default: {
    initialize: jest.fn(),
    render: jest.fn(() => Promise.resolve({ svg: '<svg></svg>' }))
  }
}))

// Mock other components
jest.mock('../../../src/components/DiagramEditor/SlideOutMenu', () => ({
  SlideOutMenu: () => <div data-testid="slide-out-menu" />
}))

const sampleSyntax = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D`

describe('MermaidEditor Clear All Functionality', () => {
  it('should render Clear All button with trash icon', () => {
    render(<MermaidEditor initialSyntax={sampleSyntax} />)
    
    const clearButton = screen.getByTitle('Clear All')
    expect(clearButton).toBeInTheDocument()
    expect(clearButton.textContent).toBe('🗑️')
  })

  it('should not render Clear All button when readOnly is true', () => {
    render(<MermaidEditor initialSyntax={sampleSyntax} readOnly={true} />)
    
    const clearButton = screen.queryByTitle('Clear All')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('should show confirmation dialog when Clear All is clicked', () => {
    const onSyntaxChange = jest.fn()
    render(<MermaidEditor initialSyntax={sampleSyntax} onSyntaxChange={onSyntaxChange} />)
    
    const clearButton = screen.getByTitle('Clear All')
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all content?')
  })

  it('should clear syntax when user confirms', () => {
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    
    const onSyntaxChange = jest.fn()
    const onClearAll = jest.fn()
    
    render(
      <MermaidEditor 
        initialSyntax={sampleSyntax} 
        onSyntaxChange={onSyntaxChange}
        onClearAll={onClearAll}
      />
    )
    
    // Check that initial syntax is displayed
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(sampleSyntax)
    
    const clearButton = screen.getByTitle('Clear All')
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(onSyntaxChange).toHaveBeenCalledWith('')
    expect(onClearAll).toHaveBeenCalled()
    expect(textarea).toHaveValue('')
  })

  it('should not clear syntax when user cancels', () => {
    ;(window.confirm as jest.Mock).mockReturnValue(false)
    
    const onSyntaxChange = jest.fn()
    const onClearAll = jest.fn()
    
    render(
      <MermaidEditor 
        initialSyntax={sampleSyntax} 
        onSyntaxChange={onSyntaxChange}
        onClearAll={onClearAll}
      />
    )
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(sampleSyntax)
    
    const clearButton = screen.getByTitle('Clear All')
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(onSyntaxChange).not.toHaveBeenCalled()
    expect(onClearAll).not.toHaveBeenCalled()
    expect(textarea).toHaveValue(sampleSyntax)
  })

  it('should have red styling to indicate destructive action', () => {
    render(<MermaidEditor />)
    
    const clearButton = screen.getByTitle('Clear All')
    expect(clearButton).toHaveClass('bg-red-100', 'text-red-700', 'hover:bg-red-200')
  })

  it('should work without onClearAll callback', () => {
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    
    const onSyntaxChange = jest.fn()
    
    render(
      <MermaidEditor 
        initialSyntax={sampleSyntax} 
        onSyntaxChange={onSyntaxChange}
      />
    )
    
    const clearButton = screen.getByTitle('Clear All')
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(onSyntaxChange).toHaveBeenCalledWith('')
  })
})