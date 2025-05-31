/**
 * Unit tests for the Clear All functionality in DiagramEditor
 * Tests the improved clear button behavior for issue #25
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiagramEditor } from '../../../src/components/DiagramEditor/DiagramEditor'
import { Node, Edge } from '@xyflow/react'

// Mock confirm function
const originalConfirm = window.confirm
beforeEach(() => {
  window.confirm = jest.fn()
})

afterEach(() => {
  window.confirm = originalConfirm
  jest.clearAllMocks()
})

// Mock ReactFlow components
jest.mock('@xyflow/react', () => ({
  ...jest.requireActual('@xyflow/react'),
  ReactFlow: ({ children, nodes, edges }: any) => (
    <div data-testid="react-flow" data-nodes-count={nodes?.length || 0} data-edges-count={edges?.length || 0}>
      {children}
    </div>
  ),
  ReactFlowProvider: ({ children }: any) => <div>{children}</div>,
  Controls: () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  MiniMap: () => <div data-testid="minimap" />,
  useNodesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  useEdgesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  useReactFlow: () => ({
    screenToFlowPosition: jest.fn(),
  }),
}))

// Mock other components
jest.mock('../../../src/components/DiagramEditor/SlideOutMenu', () => ({
  SlideOutMenu: () => <div data-testid="slide-out-menu" />
}))

jest.mock('../../../src/components/DiagramEditor/NodePropertiesPanel', () => ({
  NodePropertiesPanel: () => <div data-testid="properties-panel" />
}))

jest.mock('../../../src/components/DiagramEditor/KeyboardShortcutsPanel', () => ({
  KeyboardShortcutsPanel: () => <div data-testid="shortcuts-panel" />
}))

jest.mock('../../../src/components/DiagramEditor/MovableChatbox', () => ({
  MovableChatbox: () => <div data-testid="chatbox" />
}))

jest.mock('../../../src/lib/featureFlags', () => ({
  featureFlags: {
    aiChat: false
  }
}))

const sampleNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 100, y: 100 },
    data: { label: 'Start' }
  },
  {
    id: '2',
    type: 'process',
    position: { x: 200, y: 200 },
    data: { label: 'Process' }
  }
]

const sampleEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2'
  }
]

describe('DiagramEditor Clear All Functionality', () => {
  it('should show confirmation dialog when Clear All is clicked', () => {
    render(<DiagramEditor initialNodes={sampleNodes} initialEdges={sampleEdges} />)
    
    const clearButton = screen.getByTitle('Clear All')
    expect(clearButton).toBeInTheDocument()
    expect(clearButton.textContent).toBe('🗑️')
    
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all nodes and connections?')
  })

  it('should clear the canvas when user confirms', () => {
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    
    render(<DiagramEditor initialNodes={sampleNodes} initialEdges={sampleEdges} />)
    
    // Initially should show the sample nodes and edges
    const reactFlow = screen.getByTestId('react-flow')
    expect(reactFlow).toHaveAttribute('data-nodes-count', '2')
    expect(reactFlow).toHaveAttribute('data-edges-count', '1')
    
    const clearButton = screen.getByTitle('Clear All')
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalled()
    // After clearing, should show 0 nodes and edges
    expect(reactFlow).toHaveAttribute('data-nodes-count', '0')
    expect(reactFlow).toHaveAttribute('data-edges-count', '0')
  })

  it('should not clear the canvas when user cancels', () => {
    ;(window.confirm as jest.Mock).mockReturnValue(false)
    
    render(<DiagramEditor initialNodes={sampleNodes} initialEdges={sampleEdges} />)
    
    const reactFlow = screen.getByTestId('react-flow')
    expect(reactFlow).toHaveAttribute('data-nodes-count', '2')
    expect(reactFlow).toHaveAttribute('data-edges-count', '1')
    
    const clearButton = screen.getByTitle('Clear All')
    fireEvent.click(clearButton)
    
    expect(window.confirm).toHaveBeenCalled()
    // Should still show original nodes and edges
    expect(reactFlow).toHaveAttribute('data-nodes-count', '2')
    expect(reactFlow).toHaveAttribute('data-edges-count', '1')
  })

  it('should keep canvas clear after clearing and not fall back to defaults', () => {
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    
    render(<DiagramEditor />)
    
    const reactFlow = screen.getByTestId('react-flow')
    // Initially might show default nodes
    const initialNodeCount = reactFlow.getAttribute('data-nodes-count')
    
    const clearButton = screen.getByTitle('Clear All')
    fireEvent.click(clearButton)
    
    // After clearing, should be empty and stay empty
    expect(reactFlow).toHaveAttribute('data-nodes-count', '0')
    expect(reactFlow).toHaveAttribute('data-edges-count', '0')
  })

  it('should use trash icon instead of cleaning icon', () => {
    render(<DiagramEditor />)
    
    const clearButton = screen.getByTitle('Clear All')
    expect(clearButton.textContent).toBe('🗑️')
    expect(clearButton.textContent).not.toBe('🧹')
  })

  it('should have red styling to indicate destructive action', () => {
    render(<DiagramEditor />)
    
    const clearButton = screen.getByTitle('Clear All')
    expect(clearButton).toHaveClass('bg-red-100', 'text-red-700', 'hover:bg-red-200')
  })
})