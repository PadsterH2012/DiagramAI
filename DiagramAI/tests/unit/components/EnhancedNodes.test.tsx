import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DocumentNode } from '@/components/DiagramEditor/Nodes/DocumentNode'
import { ServerNode } from '@/components/DiagramEditor/Nodes/ServerNode'
import { RouterNode } from '@/components/DiagramEditor/Nodes/RouterNode'

// Mock ReactFlow components
jest.mock('@xyflow/react', () => ({
  Handle: ({ children, ...props }: any) => <div data-testid="handle" {...props}>{children}</div>,
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
}))

const mockNodeProps = {
  id: 'test-node',
  selected: false,
  data: {
    label: 'Test Node',
    description: 'Test Description',
    color: '#ff0000',
    icon: '📄'
  }
}

describe('Enhanced Node Components', () => {
  describe('DocumentNode', () => {
    it('renders without crashing', () => {
      render(<DocumentNode {...mockNodeProps} />)
      expect(screen.getByText('Test Node')).toBeInTheDocument()
    })

    it('displays the label and description', () => {
      render(<DocumentNode {...mockNodeProps} />)
      expect(screen.getByText('Test Node')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders with proper SVG structure', () => {
      const { container } = render(<DocumentNode {...mockNodeProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('width', '140')
      expect(svg).toHaveAttribute('height', '100')
    })

    it('renders connection handles', () => {
      render(<DocumentNode {...mockNodeProps} />)
      const handles = screen.getAllByTestId('handle')
      expect(handles).toHaveLength(4) // top, bottom, left, right
    })
  })

  describe('ServerNode', () => {
    it('renders without crashing', () => {
      render(<ServerNode {...mockNodeProps} />)
      expect(screen.getByText('Test Node')).toBeInTheDocument()
    })

    it('displays server rack visualization', () => {
      const { container } = render(<ServerNode {...mockNodeProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('width', '80')
      expect(svg).toHaveAttribute('height', '120')
    })

    it('shows status lights in SVG', () => {
      const { container } = render(<ServerNode {...mockNodeProps} />)
      const circles = container.querySelectorAll('circle')
      expect(circles.length).toBeGreaterThan(0) // Should have status light circles
    })
  })

  describe('RouterNode', () => {
    it('renders without crashing', () => {
      render(<RouterNode {...mockNodeProps} />)
      expect(screen.getByText('Test Node')).toBeInTheDocument()
    })

    it('displays hexagonal shape', () => {
      const { container } = render(<RouterNode {...mockNodeProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      
      // Check for hexagon path
      const path = container.querySelector('path')
      expect(path).toBeInTheDocument()
    })

    it('renders multiple connection handles for hexagon vertices', () => {
      render(<RouterNode {...mockNodeProps} />)
      const handles = screen.getAllByTestId('handle')
      expect(handles).toHaveLength(6) // 6 handles for hexagon vertices
    })
  })

  describe('Selected state styling', () => {
    it('applies selected styling to DocumentNode', () => {
      const selectedProps = { ...mockNodeProps, selected: true }
      const { container } = render(<DocumentNode {...selectedProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('filter', 'drop-shadow-lg')
    })

    it('applies selected styling to ServerNode', () => {
      const selectedProps = { ...mockNodeProps, selected: true }
      const { container } = render(<ServerNode {...selectedProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('filter', 'drop-shadow-lg')
    })

    it('applies selected styling to RouterNode', () => {
      const selectedProps = { ...mockNodeProps, selected: true }
      const { container } = render(<RouterNode {...selectedProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('filter', 'drop-shadow-lg')
    })
  })
})