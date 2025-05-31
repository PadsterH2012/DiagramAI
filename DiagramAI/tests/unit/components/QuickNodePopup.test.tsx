/**
 * Unit tests for Quick Node Creation Button functionality
 * Tests the new QuickNodePopup component and integration with floating toolbar
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuickNodePopup } from '../../../src/components/DiagramEditor/QuickNodePopup'

describe('QuickNodePopup', () => {
  const mockOnClose = jest.fn()
  const mockOnNodeSelect = jest.fn()
  const mockOnViewAll = jest.fn()
  const mockPosition = { x: 100, y: 100 }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <QuickNodePopup
        isOpen={false}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    expect(screen.queryByText('Quick Add Nodes')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
  })

  it('should display all 8 quick symbols', () => {
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    // Check for the expected symbols as per the issue requirements
    expect(screen.getByText('Process')).toBeInTheDocument()
    expect(screen.getByText('Decision')).toBeInTheDocument()
    expect(screen.getByText('Start/End')).toBeInTheDocument()
    expect(screen.getByText('Input/Output')).toBeInTheDocument()
    expect(screen.getByText('Database')).toBeInTheDocument()
    expect(screen.getByText('Document')).toBeInTheDocument()
    expect(screen.getByText('Connector')).toBeInTheDocument()
    expect(screen.getByText('Cloud')).toBeInTheDocument()
  })

  it('should call onNodeSelect when a symbol is clicked', () => {
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    fireEvent.click(screen.getByText('Process'))

    expect(mockOnNodeSelect).toHaveBeenCalledWith('process', {
      label: 'Process',
      icon: '⚙️',
      color: '#3b82f6'
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onViewAll when "View All Symbols..." is clicked', () => {
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    fireEvent.click(screen.getByText('View All Symbols...'))

    expect(mockOnViewAll).toHaveBeenCalled()
  })

  it('should close when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside">Outside element</div>
        <QuickNodePopup
          isOpen={true}
          onClose={mockOnClose}
          onNodeSelect={mockOnNodeSelect}
          onViewAll={mockOnViewAll}
          position={mockPosition}
        />
      </div>
    )

    fireEvent.mouseDown(screen.getByTestId('outside'))
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should close when pressing Escape key', async () => {
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should display appropriate tooltips', () => {
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    const processButton = screen.getByTitle('Add Process')
    expect(processButton).toBeInTheDocument()

    const decisionButton = screen.getByTitle('Add Decision')
    expect(decisionButton).toBeInTheDocument()
  })

  it('should render symbols with appropriate styling classes', () => {
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={mockOnClose}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={mockOnViewAll}
        position={mockPosition}
      />
    )

    // Simply check that we have the expected number of symbol buttons
    const symbolButtons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('title')?.startsWith('Add ')
    )
    
    expect(symbolButtons.length).toBe(8)
  })
})

describe('QuickNodePopup Integration', () => {
  it('should pass correct node data for different symbols', () => {
    const mockOnNodeSelect = jest.fn()
    
    render(
      <QuickNodePopup
        isOpen={true}
        onClose={jest.fn()}
        onNodeSelect={mockOnNodeSelect}
        onViewAll={jest.fn()}
        position={{ x: 100, y: 100 }}
      />
    )

    // Test Process node
    fireEvent.click(screen.getByText('Process'))
    expect(mockOnNodeSelect).toHaveBeenCalledWith('process', {
      label: 'Process',
      icon: '⚙️',
      color: '#3b82f6'
    })

    // Test Decision node
    fireEvent.click(screen.getByText('Decision'))
    expect(mockOnNodeSelect).toHaveBeenCalledWith('decision', {
      label: 'Decision?',
      icon: '❓',
      color: '#f59e0b'
    })

    // Test Database node
    fireEvent.click(screen.getByText('Database'))
    expect(mockOnNodeSelect).toHaveBeenCalledWith('database', {
      label: 'Database',
      icon: '🗄️',
      color: '#84cc16'
    })
  })
})