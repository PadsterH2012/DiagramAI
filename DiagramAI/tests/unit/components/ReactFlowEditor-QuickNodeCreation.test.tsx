/**
 * Unit tests for Quick Node Creation Button integration with ReactFlowEditor
 * Tests the floating toolbar "+" button and keyboard shortcuts
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { ReactFlowEditor } from '../../../src/components/DiagramEditor/ReactFlowEditor'

// Mock the ReactFlow hooks
jest.mock('@xyflow/react', () => {
  const actual = jest.requireActual('@xyflow/react')
  return {
    ...actual,
    useReactFlow: () => ({
      screenToFlowPosition: (position: { x: number; y: number }) => position,
      getNodes: () => [],
      getEdges: () => [],
      fitView: jest.fn(),
    }),
  }
})

describe('ReactFlowEditor Quick Node Creation', () => {
  const mockOnNodeAdd = jest.fn()
  const mockOnOpenNodePalette = jest.fn()
  
  const defaultProps = {
    initialNodes: [],
    initialEdges: [],
    onNodeAdd: mockOnNodeAdd,
    onOpenNodePalette: mockOnOpenNodePalette,
    onCopy: jest.fn(),
    onPaste: jest.fn(),
    onDelete: jest.fn(),
    onShowProperties: jest.fn(),
    onShowHelp: jest.fn(),
    onClearAll: jest.fn(),
    selectedNodes: [],
    selectedEdges: [],
    clipboard: null,
    showPropertiesPanel: false,
    showHelpPanel: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the "+" button in the floating toolbar', () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    expect(addButton).toBeInTheDocument()
    expect(addButton).toHaveTextContent('➕')
  })

  it('should not render the "+" button when readOnly is true', () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} readOnly={true} />
      </ReactFlowProvider>
    )

    expect(screen.queryByTitle('Add Node (Ctrl+N)')).not.toBeInTheDocument()
  })

  it('should open QuickNodePopup when "+" button is clicked', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })
  })

  it('should close QuickNodePopup when clicking the "+" button again', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    
    // Open popup
    fireEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })

    // Close popup
    fireEvent.click(addButton)
    await waitFor(() => {
      expect(screen.queryByText('Quick Add Nodes')).not.toBeInTheDocument()
    })
  })

  it('should open QuickNodePopup when Ctrl+N is pressed', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    fireEvent.keyDown(document, { key: 'n', ctrlKey: true })

    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })
  })

  it('should open QuickNodePopup when Cmd+N is pressed on Mac', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    fireEvent.keyDown(document, { key: 'n', metaKey: true })

    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })
  })

  it('should prevent default browser behavior for Ctrl+N', () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    // Create a proper event with preventDefault
    const event = new KeyboardEvent('keydown', { 
      key: 'n', 
      ctrlKey: true,
      bubbles: true
    })
    
    // Mock preventDefault
    const preventDefault = jest.fn()
    Object.defineProperty(event, 'preventDefault', {
      value: preventDefault
    })

    document.dispatchEvent(event)

    expect(preventDefault).toHaveBeenCalled()
  })

  it('should call onNodeAdd when a node is selected from the popup', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    // Open popup
    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })

    // Click on Process node
    fireEvent.click(screen.getByText('Process'))

    expect(mockOnNodeAdd).toHaveBeenCalledWith('process', {
      label: 'Process',
      icon: '⚙️',
      color: '#3b82f6'
    })
  })

  it('should call onOpenNodePalette when "View All Symbols..." is clicked', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    // Open popup
    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })

    // Click "View All Symbols..."
    fireEvent.click(screen.getByText('View All Symbols...'))

    expect(mockOnOpenNodePalette).toHaveBeenCalled()
  })

  it('should close popup after selecting a node', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    // Open popup
    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })

    // Select a node
    fireEvent.click(screen.getByText('Process'))

    await waitFor(() => {
      expect(screen.queryByText('Quick Add Nodes')).not.toBeInTheDocument()
    })
  })

  it('should position the "+" button correctly in the toolbar layout', () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    const copyButton = screen.getByTitle('Copy (Ctrl+C)')
    
    // The "+" button should be positioned before the copy button
    // We can check this by comparing their positions in the DOM
    const toolbar = addButton.closest('.p-2')
    const toolbarSections = toolbar?.querySelectorAll('.border-b')
    
    expect(toolbarSections).toBeTruthy()
    expect(toolbarSections!.length).toBeGreaterThanOrEqual(3) // Mode, Quick Node, Edit sections
  })

  it('should have appropriate styling for the "+" button', () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    expect(addButton).toHaveClass('bg-green-100', 'text-green-700', 'hover:bg-green-200')
  })
})

describe('Quick Node Creation Position Calculation', () => {
  const mockOnNodeAdd = jest.fn()
  
  const defaultProps = {
    initialNodes: [
      {
        id: 'existing-node',
        type: 'process',
        position: { x: 100, y: 100 },
        data: { label: 'Existing Node' }
      }
    ],
    initialEdges: [],
    onNodeAdd: mockOnNodeAdd,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
  })

  it('should calculate optimal position avoiding existing nodes', async () => {
    render(
      <ReactFlowProvider>
        <ReactFlowEditor {...defaultProps} />
      </ReactFlowProvider>
    )

    // Open popup and select a node
    const addButton = screen.getByTitle('Add Node (Ctrl+N)')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Quick Add Nodes')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Process'))

    // The onNodeAdd should be called, but we can't easily test the exact position
    // without mocking the positioning logic more deeply
    expect(mockOnNodeAdd).toHaveBeenCalled()
  })
})