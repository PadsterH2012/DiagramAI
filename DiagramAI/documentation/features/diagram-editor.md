# 🎨 DiagramAI Visual Editor Documentation

*Last Updated: May 30, 2025*

## Overview

The DiagramAI Visual Editor is built on React Flow, providing an intuitive drag-and-drop interface for creating interactive diagrams. This document covers the technical implementation, features, and usage patterns.

## 🏗️ Architecture

### Component Structure

```
DiagramEditor/
├── DiagramEditor.tsx          # Main editor container
├── ReactFlowEditor.tsx        # React Flow implementation
├── NodePalette.tsx           # Draggable node palette
├── ToolbarControls.tsx       # Editor toolbar
├── PropertyPanel.tsx         # Element properties
└── nodes/                    # Custom node components
    ├── StartNode.tsx
    ├── ProcessNode.tsx
    ├── DecisionNode.tsx
    └── EndNode.tsx
```

### State Management

**Editor State**
- **Nodes**: Array of diagram nodes with positions and data
- **Edges**: Array of connections between nodes
- **Viewport**: Current zoom and pan state
- **Selection**: Currently selected elements
- **History**: Undo/redo state management

**Real-time Synchronization**
- **WebSocket Integration**: Live updates across users
- **Conflict Resolution**: Operational transform for concurrent edits
- **Presence Indicators**: Show active users and cursors

## 🎯 Core Features

### Node System

#### Built-in Node Types

**Start Node**
```typescript
interface StartNodeData {
  label: string;
  color?: string;
  description?: string;
}
```
- **Purpose**: Process flow entry points
- **Styling**: Rounded rectangle with green accent
- **Connections**: Output handles only

**Process Node**
```typescript
interface ProcessNodeData {
  label: string;
  color?: string;
  description?: string;
  icon?: string;
}
```
- **Purpose**: Standard process steps
- **Styling**: Rectangle with customizable colors
- **Connections**: Input and output handles

**Decision Node**
```typescript
interface DecisionNodeData {
  label: string;
  condition?: string;
  trueLabel?: string;
  falseLabel?: string;
}
```
- **Purpose**: Conditional branching
- **Styling**: Diamond shape
- **Connections**: One input, multiple outputs

**End Node**
```typescript
interface EndNodeData {
  label: string;
  color?: string;
  result?: string;
}
```
- **Purpose**: Process termination points
- **Styling**: Rounded rectangle with red accent
- **Connections**: Input handles only

#### Custom Node Development

**Creating Custom Nodes**
```typescript
import { NodeProps } from 'reactflow';

interface CustomNodeData {
  label: string;
  customProperty: string;
}

export function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <h3>{data.label}</h3>
        <p>{data.customProperty}</p>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

**Node Registration**
```typescript
const nodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  end: EndNode,
  custom: CustomNode,
};
```

### Edge System

#### Edge Types

**Default Edge**
- **Style**: Straight line with arrow
- **Use Case**: Standard connections
- **Customization**: Color, width, dash pattern

**Smooth Step Edge**
- **Style**: Right-angled with rounded corners
- **Use Case**: Structured layouts
- **Customization**: Corner radius, step size

**Bezier Edge**
- **Style**: Curved connection
- **Use Case**: Organic, flowing diagrams
- **Customization**: Curve tension, control points

#### Edge Customization

```typescript
interface CustomEdgeData {
  label?: string;
  color?: string;
  animated?: boolean;
  condition?: string;
}

const edgeTypes = {
  default: DefaultEdge,
  smoothstep: SmoothStepEdge,
  bezier: BezierEdge,
  custom: CustomEdge,
};
```

### Interaction Features

#### Selection System

**Single Selection**
- Click any element to select
- Properties panel updates automatically
- Visual selection indicators

**Multi-Selection**
- Ctrl+click for individual selection
- Drag selection box for area selection
- Bulk operations on selected elements

**Group Selection**
```typescript
const handleSelectionChange = (elements: Node[] | Edge[]) => {
  setSelectedElements(elements);
  updatePropertyPanel(elements);
};
```

#### Drag and Drop

**Node Palette Integration**
```typescript
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  const nodeType = event.dataTransfer.getData('application/reactflow');
  const position = screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });
  
  addNode(nodeType, position);
};
```

#### Copy/Paste System

**Implementation**
```typescript
const handleCopy = () => {
  const selectedNodes = nodes.filter(node => node.selected);
  const selectedEdges = edges.filter(edge => edge.selected);
  
  setClipboard({ nodes: selectedNodes, edges: selectedEdges });
};

const handlePaste = () => {
  if (!clipboard) return;
  
  const newNodes = clipboard.nodes.map(node => ({
    ...node,
    id: generateId(),
    position: { x: node.position.x + 20, y: node.position.y + 20 },
  }));
  
  addNodes(newNodes);
};
```

## 🎨 Styling and Theming

### CSS Variables

```css
:root {
  --node-border-radius: 8px;
  --node-border-width: 2px;
  --node-padding: 12px;
  --edge-stroke-width: 2px;
  --selection-color: #3b82f6;
  --handle-size: 8px;
}
```

### Theme Support

**Light Theme**
```css
.react-flow.light {
  --node-bg: #ffffff;
  --node-border: #e5e7eb;
  --node-text: #1f2937;
  --edge-stroke: #6b7280;
}
```

**Dark Theme**
```css
.react-flow.dark {
  --node-bg: #1f2937;
  --node-border: #374151;
  --node-text: #f9fafb;
  --edge-stroke: #9ca3af;
}
```

### Responsive Design

**Mobile Adaptations**
- Touch-friendly handles and controls
- Simplified toolbar for small screens
- Gesture support for pan and zoom
- Responsive node sizing

## ⚡ Performance Optimization

### Large Diagram Handling

**Virtualization**
```typescript
const ReactFlowComponent = () => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onlyRenderVisibleElements={true} // Enable virtualization
      maxZoom={2}
      minZoom={0.1}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};
```

**Memory Management**
- Lazy loading of node components
- Efficient re-rendering with React.memo
- Debounced state updates
- Cleanup of event listeners

### Rendering Optimizations

**Component Memoization**
```typescript
export const ProcessNode = React.memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`process-node ${selected ? 'selected' : ''}`}>
      {/* Node content */}
    </div>
  );
});
```

**State Updates**
```typescript
const debouncedUpdateNodes = useMemo(
  () => debounce((newNodes: Node[]) => {
    setNodes(newNodes);
    onDiagramChange?.(newNodes, edges);
  }, 100),
  [edges, onDiagramChange]
);
```

## 🔧 Configuration Options

### Editor Settings

```typescript
interface DiagramEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onDiagramChange?: (nodes: Node[], edges: Edge[]) => void;
  readOnly?: boolean;
  showMiniMap?: boolean;
  showControls?: boolean;
  enablePanOnDrag?: boolean;
  enableZoomOnScroll?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  theme?: 'light' | 'dark';
}
```

### Default Configuration

```typescript
const defaultConfig = {
  showMiniMap: true,
  showControls: true,
  enablePanOnDrag: true,
  enableZoomOnScroll: true,
  snapToGrid: false,
  gridSize: 20,
  theme: 'light',
  maxZoom: 2,
  minZoom: 0.1,
};
```

## 🧪 Testing

### Unit Tests

**Node Rendering Tests**
```typescript
describe('ProcessNode', () => {
  it('renders with correct label', () => {
    const data = { label: 'Test Process' };
    render(<ProcessNode data={data} selected={false} />);
    expect(screen.getByText('Test Process')).toBeInTheDocument();
  });
});
```

**Interaction Tests**
```typescript
describe('DiagramEditor', () => {
  it('adds node on palette drag and drop', async () => {
    const onDiagramChange = jest.fn();
    render(<DiagramEditor onDiagramChange={onDiagramChange} />);
    
    // Simulate drag and drop
    const palette = screen.getByTestId('node-palette');
    const canvas = screen.getByTestId('react-flow');
    
    fireEvent.dragStart(palette, { dataTransfer: { setData: jest.fn() } });
    fireEvent.drop(canvas, { clientX: 100, clientY: 100 });
    
    expect(onDiagramChange).toHaveBeenCalled();
  });
});
```

### Integration Tests

**Real-time Collaboration**
```typescript
describe('Real-time Updates', () => {
  it('syncs changes across multiple editors', async () => {
    // Test WebSocket synchronization
    const editor1 = render(<DiagramEditor />);
    const editor2 = render(<DiagramEditor />);
    
    // Add node in editor1
    // Verify it appears in editor2
  });
});
```

## 📚 API Reference

### Core Methods

**addNode(type: string, position: XYPosition)**
- Adds a new node to the diagram
- Returns the created node ID

**removeNode(nodeId: string)**
- Removes a node and its connected edges
- Updates diagram state

**addEdge(source: string, target: string)**
- Creates connection between nodes
- Returns the created edge ID

**updateNodeData(nodeId: string, data: Partial<NodeData>)**
- Updates node properties
- Triggers re-render and sync

### Event Handlers

**onNodeClick(event: MouseEvent, node: Node)**
**onNodeDoubleClick(event: MouseEvent, node: Node)**
**onNodeDrag(event: MouseEvent, node: Node)**
**onEdgeClick(event: MouseEvent, edge: Edge)**
**onSelectionChange(elements: (Node | Edge)[])**

## 🔗 Integration Points

### AI Integration
- Automatic layout generation
- Smart node suggestions
- Content enhancement

### Real-time Collaboration
- WebSocket event handling
- Conflict resolution
- Presence indicators

### Export System
- PNG/SVG generation
- PDF creation
- JSON serialization

---

*For implementation examples and advanced usage patterns, see the [Development Guide](../development/quick-start.md) and [API Documentation](../api/rest-api-reference.md).*
