# Frontend LLD 02: Interactive Diagram Components and Editor Integration

## Document Information

**Project Name:** DiagramAI  
**Version:** 1.0  
**Date:** May 29, 2025  
**Document Type:** Low-Level Design - Frontend Interactive Components  
**Domain:** Frontend Architecture  
**Coverage Area:** Interactive diagram editing, React Flow integration, Mermaid components  
**Prerequisites:** uxui_lld_01.md, project_hld.md, techstack.md  

## Purpose and Scope

This document defines the interactive diagram editing components and editor integration for DiagramAI. It establishes the React Flow integration, Mermaid component implementation, bidirectional conversion interface, and collaborative editing features that enable powerful diagram creation and manipulation.

**Coverage Areas in This Document:**
- React Flow integration and customization
- Mermaid.js component implementation
- Bidirectional format conversion interface
- Interactive editing tools and controls
- Collaborative editing and real-time synchronization

**Related LLD Files:**
- uxui_lld_01.md: User interface design and component architecture
- uxui_lld_03.md: Accessibility and animation systems
- coding_lld_02.md: AI integration and format conversion services

## Technology Foundation

### Interactive Components Technology Stack
Based on validated research findings and diagram editing requirements:

**Diagram Editing:**
- **React Flow 12.6+**: Interactive visual diagram editing with nodes and edges
- **Mermaid.js 11+**: Text-based diagram rendering and editing
- **Monaco Editor**: Code editor for Mermaid syntax editing

**Real-time Collaboration:**
- **WebSocket/Socket.io**: Real-time collaborative editing
- **Y.js**: Conflict-free replicated data types (CRDTs) for collaboration
- **React DnD**: Drag and drop functionality

**Performance:**
- **React.memo**: Component memoization for performance
- **useMemo/useCallback**: Hook optimization
- **Virtual Scrolling**: Large diagram performance

## React Flow Integration

### 1. Custom React Flow Implementation
```typescript
// components/DiagramEditor/ReactFlowEditor.tsx
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
} from 'reactflow';

interface ReactFlowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  readOnly?: boolean;
  collaborativeMode?: boolean;
}

export const ReactFlowEditor: React.FC<ReactFlowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  readOnly = false,
  collaborativeMode = false,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  // Custom node types
  const nodeTypes = useMemo(() => ({
    default: DefaultNode,
    process: ProcessNode,
    decision: DecisionNode,
    start: StartNode,
    end: EndNode,
    custom: CustomNode,
  }), []);

  // Custom edge types
  const edgeTypes = useMemo(() => ({
    default: DefaultEdge,
    animated: AnimatedEdge,
    custom: CustomEdge,
  }), []);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'default',
        animated: false,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      onEdgesChange?.(edges);
    },
    [edges, onEdgesChange, setEdges]
  );

  const onNodesChangeHandler = useCallback(
    (changes: any[]) => {
      onNodesChangeInternal(changes);
      onNodesChange?.(nodes);
    },
    [nodes, onNodesChange, onNodesChangeInternal]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any[]) => {
      onEdgesChangeInternal(changes);
      onEdgesChange?.(edges);
    },
    [edges, onEdgesChange, onEdgesChangeInternal]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
};
```

### 2. Custom Node Components
```typescript
// components/DiagramEditor/Nodes/ProcessNode.tsx
import { Handle, Position, NodeProps } from 'reactflow';
import { memo } from 'react';

interface ProcessNodeData {
  label: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const ProcessNode = memo<NodeProps<ProcessNodeData>>(({ data, selected }) => {
  return (
    <div className={`
      px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[150px]
      ${selected ? 'border-blue-500' : 'border-gray-300'}
      hover:shadow-lg transition-shadow
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />
      
      <div className="flex items-center space-x-2">
        {data.icon && (
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-lg">{data.icon}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {data.label}
          </div>
          {data.description && (
            <div className="text-xs text-gray-500 mt-1">
              {data.description}
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
});

ProcessNode.displayName = 'ProcessNode';
```

### 3. Node Palette Component
```typescript
// components/DiagramEditor/NodePalette.tsx
interface NodePaletteProps {
  onNodeAdd: (nodeType: string, nodeData: any) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeAdd }) => {
  const nodeTemplates = [
    {
      type: 'start',
      label: 'Start',
      icon: '▶️',
      description: 'Start point of the process',
      data: { label: 'Start' }
    },
    {
      type: 'process',
      label: 'Process',
      icon: '⚙️',
      description: 'Process or action step',
      data: { label: 'Process' }
    },
    {
      type: 'decision',
      label: 'Decision',
      icon: '❓',
      description: 'Decision or branching point',
      data: { label: 'Decision?' }
    },
    {
      type: 'end',
      label: 'End',
      icon: '⏹️',
      description: 'End point of the process',
      data: { label: 'End' }
    },
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      data: nodeData
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Node Palette</h3>
      
      <div className="space-y-2">
        {nodeTemplates.map((template) => (
          <div
            key={template.type}
            className="p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, template.type, template.data)}
            onClick={() => onNodeAdd(template.type, template.data)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{template.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {template.label}
                </div>
                <div className="text-xs text-gray-500">
                  {template.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Mermaid Integration

### 1. Mermaid Editor Component
```typescript
// components/DiagramEditor/MermaidEditor.tsx
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Editor } from '@monaco-editor/react';

interface MermaidEditorProps {
  initialSyntax?: string;
  onSyntaxChange?: (syntax: string) => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({
  initialSyntax = '',
  onSyntaxChange,
  readOnly = false,
  theme = 'light',
}) => {
  const [syntax, setSyntax] = useState(initialSyntax);
  const [renderError, setRenderError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });
  }, [theme]);

  // Render Mermaid diagram
  useEffect(() => {
    if (!syntax.trim() || !previewRef.current) return;

    const renderDiagram = async () => {
      try {
        setRenderError(null);
        
        // Clear previous content
        previewRef.current!.innerHTML = '';
        
        // Generate unique ID for this render
        const id = `mermaid-${Date.now()}`;
        
        // Validate and render
        const { svg } = await mermaid.render(id, syntax);
        previewRef.current!.innerHTML = svg;
        
      } catch (error) {
        console.error('Mermaid render error:', error);
        setRenderError(error instanceof Error ? error.message : 'Render error');
        previewRef.current!.innerHTML = `
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="text-red-800 font-medium">Syntax Error</div>
            <div class="text-red-600 text-sm mt-1">${error instanceof Error ? error.message : 'Unknown error'}</div>
          </div>
        `;
      }
    };

    const debounceTimer = setTimeout(renderDiagram, 500);
    return () => clearTimeout(debounceTimer);
  }, [syntax]);

  const handleSyntaxChange = (value: string | undefined) => {
    const newSyntax = value || '';
    setSyntax(newSyntax);
    onSyntaxChange?.(newSyntax);
  };

  return (
    <div className="flex h-full">
      {/* Editor Panel */}
      <div className="w-1/2 border-r border-gray-200">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
          <span className="text-sm font-medium text-gray-700">Mermaid Syntax</span>
        </div>
        <Editor
          height="calc(100% - 2rem)"
          language="mermaid"
          value={syntax}
          onChange={handleSyntaxChange}
          options={{
            readOnly,
            minimap: { enabled: false },
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            theme: theme === 'dark' ? 'vs-dark' : 'vs',
          }}
        />
      </div>

      {/* Preview Panel */}
      <div className="w-1/2">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
          <span className="text-sm font-medium text-gray-700">Preview</span>
          {renderError && (
            <span className="ml-2 text-xs text-red-600">⚠️ Syntax Error</span>
          )}
        </div>
        <div className="h-[calc(100%-2rem)] overflow-auto p-4 bg-white">
          <div ref={previewRef} className="w-full h-full flex items-center justify-center" />
        </div>
      </div>
    </div>
  );
};
```

### 2. Mermaid Syntax Helpers
```typescript
// utils/mermaidHelpers.ts
export const mermaidTemplates = {
  flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
    
  sequence: `sequenceDiagram
    participant A as User
    participant B as System
    A->>B: Request
    B-->>A: Response`,
    
  class: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }`,
    
  state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Complete : finish
    Complete --> [*]`,
    
  er: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "ordered in"`
};

export const validateMermaidSyntax = (syntax: string): { isValid: boolean; error?: string } => {
  try {
    // Basic syntax validation
    if (!syntax.trim()) {
      return { isValid: false, error: 'Empty diagram' };
    }
    
    // Check for basic diagram type
    const diagramTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram'];
    const hasValidType = diagramTypes.some(type => syntax.includes(type));
    
    if (!hasValidType) {
      return { isValid: false, error: 'No valid diagram type found' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Validation error' };
  }
};

export const formatMermaidSyntax = (syntax: string): string => {
  // Basic formatting for Mermaid syntax
  return syntax
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
};
```

## Format Conversion Interface

### 1. Conversion Component
```typescript
// components/DiagramEditor/FormatConverter.tsx
interface FormatConverterProps {
  currentFormat: 'react_flow' | 'mermaid';
  currentContent: any;
  onFormatChange: (format: 'react_flow' | 'mermaid', content: any) => void;
  isConverting?: boolean;
}

export const FormatConverter: React.FC<FormatConverterProps> = ({
  currentFormat,
  currentContent,
  onFormatChange,
  isConverting = false,
}) => {
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryItem[]>([]);

  const handleConvert = async (targetFormat: 'react_flow' | 'mermaid') => {
    if (currentFormat === targetFormat) return;

    try {
      const response = await fetch('/api/ai/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          fromFormat: currentFormat,
          toFormat: targetFormat,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onFormatChange(targetFormat, result.content);
        
        // Add to conversion history
        setConversionHistory(prev => [...prev, {
          id: Date.now().toString(),
          fromFormat: currentFormat,
          toFormat: targetFormat,
          timestamp: new Date(),
          success: true,
        }]);
      } else {
        throw new Error(result.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      // Handle error (show toast, etc.)
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Format:</span>
        <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
          <button
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              currentFormat === 'react_flow'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => currentFormat !== 'react_flow' && handleConvert('react_flow')}
            disabled={isConverting}
          >
            Visual
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              currentFormat === 'mermaid'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => currentFormat !== 'mermaid' && handleConvert('mermaid')}
            disabled={isConverting}
          >
            Code
          </button>
        </div>
      </div>

      {isConverting && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span>Converting...</span>
        </div>
      )}

      <div className="flex-1" />

      <button
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        onClick={() => {/* Show conversion history */}}
      >
        History ({conversionHistory.length})
      </button>
    </div>
  );
};
```

### 2. Unified Diagram Editor
```typescript
// components/DiagramEditor/UnifiedDiagramEditor.tsx
interface UnifiedDiagramEditorProps {
  diagramId?: string;
  initialContent?: any;
  initialFormat?: 'react_flow' | 'mermaid';
  onSave?: (content: any, format: string) => void;
  readOnly?: boolean;
}

export const UnifiedDiagramEditor: React.FC<UnifiedDiagramEditorProps> = ({
  diagramId,
  initialContent,
  initialFormat = 'react_flow',
  onSave,
  readOnly = false,
}) => {
  const [currentFormat, setCurrentFormat] = useState<'react_flow' | 'mermaid'>(initialFormat);
  const [content, setContent] = useState(initialContent);
  const [isConverting, setIsConverting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFormatChange = async (newFormat: 'react_flow' | 'mermaid', newContent: any) => {
    setIsConverting(true);
    try {
      setCurrentFormat(newFormat);
      setContent(newContent);
      setHasUnsavedChanges(true);
    } finally {
      setIsConverting(false);
    }
  };

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(content, currentFormat);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <FormatConverter
          currentFormat={currentFormat}
          currentContent={content}
          onFormatChange={handleFormatChange}
          isConverting={isConverting}
        />
        
        {!readOnly && (
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600">Unsaved changes</span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {currentFormat === 'react_flow' ? (
          <div className="flex h-full">
            <NodePalette onNodeAdd={(type, data) => {/* Handle node add */}} />
            <div className="flex-1">
              <ReactFlowEditor
                initialNodes={content?.nodes || []}
                initialEdges={content?.edges || []}
                onNodesChange={(nodes) => handleContentChange({ ...content, nodes })}
                onEdgesChange={(edges) => handleContentChange({ ...content, edges })}
                readOnly={readOnly}
              />
            </div>
          </div>
        ) : (
          <MermaidEditor
            initialSyntax={content?.syntax || ''}
            onSyntaxChange={(syntax) => handleContentChange({ ...content, syntax })}
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  );
};
```

## Collaborative Editing

### 1. Real-time Collaboration Hook
```typescript
// hooks/useCollaboration.ts
export const useCollaboration = (diagramId: string) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = io('/collaboration', {
      query: { diagramId }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('collaborators-updated', (collaborators: Collaborator[]) => {
      setCollaborators(collaborators);
    });

    socketRef.current.on('diagram-updated', (update: DiagramUpdate) => {
      // Handle real-time diagram updates
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [diagramId]);

  const sendUpdate = useCallback((update: DiagramUpdate) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('diagram-update', update);
    }
  }, [isConnected]);

  return {
    collaborators,
    isConnected,
    sendUpdate,
  };
};
```

### 2. Collaboration Indicators
```typescript
// components/DiagramEditor/CollaborationIndicators.tsx
interface CollaborationIndicatorsProps {
  collaborators: Collaborator[];
  isConnected: boolean;
}

export const CollaborationIndicators: React.FC<CollaborationIndicatorsProps> = ({
  collaborators,
  isConnected,
}) => {
  return (
    <div className="flex items-center space-x-4 p-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {collaborators.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Collaborators:</span>
          <div className="flex -space-x-2">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                title={collaborator.name}
              >
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Performance Optimization

### 1. Memoized Components
```typescript
// Optimized node component with memoization
export const OptimizedNode = memo<NodeProps>(({ data, selected }) => {
  return (
    <div className={`node ${selected ? 'selected' : ''}`}>
      {data.label}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.data.label === nextProps.data.label &&
    prevProps.selected === nextProps.selected
  );
});
```

### 2. Virtual Scrolling for Large Diagrams
```typescript
// hooks/useVirtualization.ts
export const useVirtualization = (items: any[], containerHeight: number, itemHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight), items.length);
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: visibleStart * itemHeight,
    onScroll: (e: React.UIEvent) => setScrollTop(e.currentTarget.scrollTop),
  };
};
```

## Next Steps and Related Documents

**Immediate Next Steps:**
1. Review uxui_lld_03.md for accessibility and animation systems
2. Integrate with backend AI services for intelligent editing features
3. Implement comprehensive testing for interactive components

**Related Documentation:**
- **Application Documentation**: `/docs/documentation/frontend/diagram-editor.md`
- **Component Documentation**: `/docs/documentation/frontend/interactive-components.md`
- **Integration Documentation**: `/docs/documentation/frontend/react-flow-integration.md`

**Integration Points:**
- **Backend**: AI-powered diagram generation and analysis
- **Database**: Diagram content storage and version management
- **Real-time**: WebSocket integration for collaborative editing
- **Performance**: Optimization for large diagrams and complex interactions

This comprehensive interactive component design provides powerful, intuitive, and performant diagram editing capabilities while supporting real-time collaboration and seamless format conversion between visual and text-based representations.
