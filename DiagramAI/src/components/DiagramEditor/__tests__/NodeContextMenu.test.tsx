import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NodeContextMenu } from '../NodeContextMenu'
import { Node } from '@xyflow/react'

// Mock node for testing
const mockNode: Node = {
  id: 'test-node-1',
  type: 'process',
  position: { x: 100, y: 100 },
  data: { label: 'Test Process Node' }
}

// Mock handlers
const mockHandlers = {
  onClose: jest.fn(),
  onShowProperties: jest.fn(),
  onDelete: jest.fn(),
  onCopy: jest.fn(),
  onDuplicate: jest.fn()
}

describe('NodeContextMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when not visible', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={false}
        {...mockHandlers}
      />
    )

    expect(screen.queryByText('process Node')).not.toBeInTheDocument()
  })

  it('should render when visible with correct node information', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    // Check for the header text specifically
    expect(screen.getByText('process Node')).toBeInTheDocument()
    expect(screen.getByText('Test Process Node')).toBeInTheDocument()
  })

  it('should render all menu items', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Properties')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should show keyboard shortcuts', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
    expect(screen.getByText('Del')).toBeInTheDocument()
  })

  it('should call onShowProperties when Properties is clicked', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('Properties'))
    expect(mockHandlers.onShowProperties).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onCopy when Copy is clicked', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('Copy'))
    expect(mockHandlers.onCopy).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onDuplicate when Duplicate is clicked', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('Duplicate'))
    expect(mockHandlers.onDuplicate).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onDelete when Delete is clicked', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    fireEvent.click(screen.getByText('Delete'))
    expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
  })

  it('should close when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside">Outside element</div>
        <NodeContextMenu
          node={mockNode}
          position={{ x: 100, y: 100 }}
          isVisible={true}
          {...mockHandlers}
        />
      </div>
    )

    fireEvent.mouseDown(screen.getByTestId('outside'))
    await waitFor(() => {
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('should close when pressing Escape key', async () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('should not render Duplicate button when onDuplicate is not provided', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        onClose={mockHandlers.onClose}
        onShowProperties={mockHandlers.onShowProperties}
        onDelete={mockHandlers.onDelete}
        onCopy={mockHandlers.onCopy}
        // onDuplicate not provided
      />
    )

    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
    expect(screen.getByText('Properties')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should handle node without label gracefully', () => {
    const nodeWithoutLabel: Node = {
      id: 'test-node-2',
      type: 'decision',
      position: { x: 200, y: 200 },
      data: {}
    }

    render(
      <NodeContextMenu
        node={nodeWithoutLabel}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    expect(screen.getByText(/decision.*Node/i)).toBeInTheDocument()
    expect(screen.getByText('test-node-2')).toBeInTheDocument() // Falls back to ID
  })

  it('should prevent context menu on the menu itself', () => {
    render(
      <NodeContextMenu
        node={mockNode}
        position={{ x: 100, y: 100 }}
        isVisible={true}
        {...mockHandlers}
      />
    )

    const menu = screen.getByText('Properties').closest('div')
    const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true })
    const preventDefaultSpy = jest.spyOn(contextMenuEvent, 'preventDefault')

    if (menu) {
      fireEvent(menu, contextMenuEvent)
      expect(preventDefaultSpy).toHaveBeenCalled()
    }
  })

  it('should position menu correctly', () => {
    const position = { x: 150, y: 250 }

    render(
      <NodeContextMenu
        node={mockNode}
        position={position}
        isVisible={true}
        {...mockHandlers}
      />
    )

    // Find the actual menu container (the one with the fixed positioning)
    const menu = document.querySelector('.fixed.z-50.bg-white')
    expect(menu).toHaveStyle({
      left: `${position.x}px`,
      top: `${position.y}px`
    })
  })
})
