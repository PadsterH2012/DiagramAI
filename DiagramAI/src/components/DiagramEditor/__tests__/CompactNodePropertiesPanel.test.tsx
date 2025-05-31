/**
 * Simple validation test for compact node properties
 */

import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CompactNodePropertiesPanel } from '../CompactNodePropertiesPanel'

// Mock React Flow
jest.mock('@xyflow/react', () => ({
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom'
  }
}))

const mockNode = {
  id: 'test-node',
  type: 'process',
  position: { x: 0, y: 0 },
  data: {
    label: 'Test Node',
    color: '#3b82f6',
    backgroundColor: '#ffffff'
  }
}

describe('CompactNodePropertiesPanel', () => {
  const mockOnNodeUpdate = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(
      <CompactNodePropertiesPanel
        selectedNode={mockNode}
        onNodeUpdate={mockOnNodeUpdate}
        onClose={mockOnClose}
      />
    )
  })

  it('renders nothing when no node is selected', () => {
    const { container } = render(
      <CompactNodePropertiesPanel
        selectedNode={null}
        onNodeUpdate={mockOnNodeUpdate}
        onClose={mockOnClose}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('displays node properties when node is selected', () => {
    const { getByDisplayValue } = render(
      <CompactNodePropertiesPanel
        selectedNode={mockNode}
        onNodeUpdate={mockOnNodeUpdate}
        onClose={mockOnClose}
      />
    )
    
    expect(getByDisplayValue('Test Node')).toBeInTheDocument()
  })
})