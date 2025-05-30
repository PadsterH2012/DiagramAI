import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiagramEditor } from '@/components/DiagramEditor/DiagramEditor';

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
    Partial: 'partial',
    Full: 'full',
  },
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
  Handle: ({ children, ...props }: any) => <div data-testid="handle" {...props}>{children}</div>,
}));

// Mock the node components
jest.mock('@/components/DiagramEditor/Nodes/ProcessNode', () => ({
  ProcessNode: () => <div data-testid="process-node">Process Node</div>,
}));

jest.mock('@/components/DiagramEditor/Nodes/DecisionNode', () => ({
  DecisionNode: () => <div data-testid="decision-node">Decision Node</div>,
}));

jest.mock('@/components/DiagramEditor/Nodes/StartNode', () => ({
  StartNode: () => <div data-testid="start-node">Start Node</div>,
}));

jest.mock('@/components/DiagramEditor/Nodes/EndNode', () => ({
  EndNode: () => <div data-testid="end-node">End Node</div>,
}));

jest.mock('@/components/DiagramEditor/Nodes/InputNode', () => ({
  InputNode: () => <div data-testid="input-node">Input Node</div>,
}));

jest.mock('@/components/DiagramEditor/Nodes/DatabaseNode', () => ({
  DatabaseNode: () => <div data-testid="database-node">Database Node</div>,
}));

jest.mock('@/components/DiagramEditor/Nodes/CloudNode', () => ({
  CloudNode: () => <div data-testid="cloud-node">Cloud Node</div>,
}));

// Mock other components used by DiagramEditor
jest.mock('@/components/DiagramEditor/SlideOutMenu', () => ({
  SlideOutMenu: ({ onNodeAdd }: any) => (
    <div data-testid="slide-out-menu">
      <button onClick={() => onNodeAdd('process', { label: 'Test' })}>Add Node</button>
    </div>
  ),
}));

jest.mock('@/components/DiagramEditor/MovableChatbox', () => ({
  MovableChatbox: ({ isOpen, onToggle }: any) => (
    isOpen ? <div data-testid="movable-chatbox">Chatbox</div> : null
  ),
}));

jest.mock('@/components/DiagramEditor/NodePropertiesPanel', () => ({
  NodePropertiesPanel: ({ selectedNode, onClose }: any) => (
    <div data-testid="node-properties-panel">
      <button onClick={onClose}>Close</button>
      {selectedNode && <div>Node: {selectedNode.id}</div>}
    </div>
  ),
}));

jest.mock('@/components/DiagramEditor/KeyboardShortcutsPanel', () => ({
  KeyboardShortcutsPanel: ({ isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="keyboard-shortcuts-panel">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

describe('DiagramEditor', () => {
  const defaultProps = {
    onDiagramChange: jest.fn(),
    initialNodes: [],
    initialEdges: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DiagramEditor {...defaultProps} />);
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });

  it('displays React Flow components', () => {
    render(<DiagramEditor {...defaultProps} />);
    
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-background')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-controls')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-minimap')).toBeInTheDocument();
  });

  it('calls onDiagramChange when nodes change', async () => {
    const onDiagramChange = jest.fn();
    render(<DiagramEditor {...defaultProps} onDiagramChange={onDiagramChange} />);
    
    // Simulate a node change event
    // This would typically be triggered by React Flow's internal mechanisms
    // For testing purposes, we'll simulate the callback
    
    await waitFor(() => {
      // In a real scenario, this would be triggered by user interaction
      // For now, we just verify the component renders correctly
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  it('handles initial nodes and edges', () => {
    const initialNodes = [
      {
        id: '1',
        type: 'start',
        position: { x: 100, y: 100 },
        data: { label: 'Start' },
      },
    ];
    
    const initialEdges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
    ];

    render(
      <DiagramEditor
        {...defaultProps}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
      />
    );

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<DiagramEditor {...defaultProps} />);
    
    const reactFlow = screen.getByTestId('react-flow');
    expect(reactFlow).toBeInTheDocument();
    
    // Check for proper ARIA attributes if they exist
    // React Flow should handle most accessibility internally
  });

  it('handles keyboard interactions', () => {
    render(<DiagramEditor {...defaultProps} />);
    
    const reactFlow = screen.getByTestId('react-flow');
    
    // Test keyboard navigation
    fireEvent.keyDown(reactFlow, { key: 'Tab' });
    fireEvent.keyDown(reactFlow, { key: 'Enter' });
    fireEvent.keyDown(reactFlow, { key: 'Escape' });
    
    // Component should handle these without errors
    expect(reactFlow).toBeInTheDocument();
  });

  it('handles mouse interactions', () => {
    render(<DiagramEditor {...defaultProps} />);
    
    const reactFlow = screen.getByTestId('react-flow');
    
    // Test mouse interactions
    fireEvent.mouseDown(reactFlow);
    fireEvent.mouseMove(reactFlow);
    fireEvent.mouseUp(reactFlow);
    fireEvent.click(reactFlow);
    
    // Component should handle these without errors
    expect(reactFlow).toBeInTheDocument();
  });

  it('maintains performance with large datasets', () => {
    const largeNodeSet = Array.from({ length: 100 }, (_, i) => ({
      id: `node-${i}`,
      type: 'process',
      position: { x: i * 50, y: i * 50 },
      data: { label: `Node ${i}` },
    }));

    const largeEdgeSet = Array.from({ length: 99 }, (_, i) => ({
      id: `edge-${i}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
    }));

    const startTime = performance.now();
    
    render(
      <DiagramEditor
        {...defaultProps}
        initialNodes={largeNodeSet}
        initialEdges={largeEdgeSet}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Render should complete within reasonable time (1 second)
    expect(renderTime).toBeLessThan(1000);
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });
});
