import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedDiagramEditor } from '@/components/DiagramEditor/UnifiedDiagramEditor';

// Mock React Flow
jest.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      {children}
    </div>
  ),
  Background: () => <div data-testid="react-flow-background" />,
  Controls: () => <div data-testid="react-flow-controls" />,
  MiniMap: () => <div data-testid="react-flow-minimap" />,
  ReactFlowProvider: ({ children }: any) => <div>{children}</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  addEdge: jest.fn(),
  useReactFlow: () => ({
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    setNodes: jest.fn(),
    setEdges: jest.fn(),
    screenToFlowPosition: jest.fn((pos) => pos),
  }),
  ConnectionMode: {
    Loose: 'loose',
    Strict: 'strict',
  },
  SelectionMode: {
    Single: 'single',
    Multiple: 'multiple',
  },
}));

// Mock mermaid
jest.mock('mermaid', () => ({
  default: {
    initialize: jest.fn(),
    render: jest.fn().mockResolvedValue({ svg: '<svg>Mock SVG</svg>' }),
  },
}));

// Mock the diagram service
jest.mock('@/services/diagramService', () => ({
  diagramService: {
    autoSave: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('UnifiedDiagramEditor', () => {
  describe('Hamburger Menu Consistency', () => {
    it('should render hamburger menu in Visual Editor tab', () => {
      render(<UnifiedDiagramEditor />);
      
      // Should start with Visual Editor tab active
      expect(screen.getByText('🎨 Visual Editor')).toHaveClass('border-blue-500');
      
      // Should have hamburger menu visible
      const hamburgerButton = screen.getByTitle('Open Menu');
      expect(hamburgerButton).toBeInTheDocument();
    });

    it('should render hamburger menu in Mermaid Code tab', () => {
      render(<UnifiedDiagramEditor />);
      
      // Switch to Mermaid Code tab
      const mermaidTab = screen.getByText('📝 Mermaid Code');
      fireEvent.click(mermaidTab);
      
      // Should now be on Mermaid tab
      expect(mermaidTab).toHaveClass('border-blue-500');
      
      // Should still have hamburger menu visible
      const hamburgerButton = screen.getByTitle('Open Menu');
      expect(hamburgerButton).toBeInTheDocument();
    });

    it('should maintain hamburger menu when switching between tabs', () => {
      render(<UnifiedDiagramEditor />);
      
      // Start with Visual Editor
      expect(screen.getByTitle('Open Menu')).toBeInTheDocument();
      
      // Switch to Mermaid Code
      fireEvent.click(screen.getByText('📝 Mermaid Code'));
      expect(screen.getByTitle('Open Menu')).toBeInTheDocument();
      
      // Switch back to Visual Editor
      fireEvent.click(screen.getByText('🎨 Visual Editor'));
      expect(screen.getByTitle('Open Menu')).toBeInTheDocument();
    });

    it('should open and close hamburger menu in both tabs', () => {
      render(<UnifiedDiagramEditor />);

      // Test in Visual Editor tab
      const hamburgerButton = screen.getByTitle('Open Menu');
      fireEvent.click(hamburgerButton);
      // Use more specific selector for the slide-out menu header
      expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();

      const closeButton = screen.getByTitle('Close Menu');
      fireEvent.click(closeButton);

      // Switch to Mermaid Code tab
      fireEvent.click(screen.getByText('📝 Mermaid Code'));

      // Test hamburger menu in Mermaid tab
      const hamburgerButtonMermaid = screen.getByTitle('Open Menu');
      fireEvent.click(hamburgerButtonMermaid);
      // Use more specific selector for the slide-out menu header
      expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    });
  });
});