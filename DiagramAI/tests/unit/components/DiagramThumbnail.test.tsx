import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DiagramThumbnail from '@/components/DiagramThumbnail'

// Mock the dynamic imports since they cause issues in tests
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFunc: any, options: any) => {
    if (options.loading) {
      return () => options.loading()
    }
    return () => <div>Mocked Dynamic Component</div>
  }
}))

describe('DiagramThumbnail', () => {
  const defaultProps = {
    format: 'reactflow' as const,
    title: 'Test Diagram',
    width: 200,
    height: 150
  }

  describe('Blank diagram handling', () => {
    it('should render blank placeholder for empty ReactFlow diagram', () => {
      const emptyReactFlowContent = {
        nodes: [],
        edges: []
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          content={emptyReactFlowContent}
        />
      )

      expect(screen.getByText('Empty Visual Diagram')).toBeInTheDocument()
      expect(screen.getByText('🎨')).toBeInTheDocument()
    })

    it('should render blank placeholder for empty Mermaid diagram', () => {
      const emptyMermaidContent = {
        syntax: ''
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          format="mermaid"
          content={emptyMermaidContent}
        />
      )

      expect(screen.getByText('Empty Mermaid Diagram')).toBeInTheDocument()
      expect(screen.getByText('📝')).toBeInTheDocument()
    })

    it('should render blank placeholder for null content', () => {
      render(
        <DiagramThumbnail
          {...defaultProps}
          content={null}
        />
      )

      expect(screen.getByText('Empty Visual Diagram')).toBeInTheDocument()
    })

    it('should render blank placeholder for undefined content', () => {
      render(
        <DiagramThumbnail
          {...defaultProps}
          content={undefined}
        />
      )

      expect(screen.getByText('Empty Visual Diagram')).toBeInTheDocument()
    })
  })

  describe('Content diagram handling', () => {
    it('should render diagram content for ReactFlow with nodes', () => {
      const reactFlowContent = {
        nodes: [
          { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }
        ],
        edges: []
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          content={reactFlowContent}
        />
      )

      // Should render the content (either loading state or actual component)
      // The dynamic import will show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render diagram content for Mermaid with syntax', () => {
      const mermaidContent = {
        syntax: 'graph TD\nA --> B'
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          format="mermaid"
          content={mermaidContent}
        />
      )

      // Should render the content (either loading state or actual component)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Format indicators', () => {
    it('should show visual indicator for ReactFlow diagrams', () => {
      const content = {
        nodes: [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Test' } }],
        edges: []
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          content={content}
        />
      )

      // Check for ReactFlow indicator
      const indicators = screen.getAllByText('🎨')
      expect(indicators.length).toBeGreaterThan(0)
    })

    it('should show mermaid indicator for Mermaid diagrams', () => {
      const content = {
        syntax: 'graph TD\nA --> B'
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          format="mermaid"
          content={content}
        />
      )

      // Check for Mermaid indicator
      const indicators = screen.getAllByText('📝')
      expect(indicators.length).toBeGreaterThan(0)
    })
  })

  describe('Unsupported formats', () => {
    it('should handle unsupported format gracefully', () => {
      const content = { some: 'data' }

      render(
        <DiagramThumbnail
          {...defaultProps}
          format={'unknown' as any}
          content={content}
        />
      )

      // Unsupported formats are treated as blank content, so show the empty state  
      expect(screen.getByText('Empty Mermaid Diagram')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('should handle malformed content gracefully', () => {
      const malformedContent = {
        nodes: 'not an array',
        edges: null
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          content={malformedContent}
        />
      )

      // Should show loading state when content is malformed but not recognized as blank
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call onClick when thumbnail is clicked', () => {
      const handleClick = jest.fn()
      const content = {
        nodes: [],
        edges: []
      }

      render(
        <DiagramThumbnail
          {...defaultProps}
          content={content}
          onClick={handleClick}
        />
      )

      const thumbnail = screen.getByText('Empty Visual Diagram').closest('div')
      if (thumbnail) {
        thumbnail.click()
        expect(handleClick).toHaveBeenCalledTimes(1)
      }
    })
  })
})