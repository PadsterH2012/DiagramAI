# 📚 DiagramAI MCP API Reference

## Overview

This document provides a comprehensive reference for all MCP tools available in DiagramAI. Each tool supports real-time collaboration with automatic conflict resolution.

## 🔧 Authentication

All MCP tools require authentication via API key:

```typescript
// Set in environment
process.env.DIAGRAMAI_API_KEY = "your-api-key";

// Or pass in MCP client configuration
const client = new Client({
  name: 'My Agent',
  version: '1.0.0'
}, {
  capabilities: { tools: {} }
});
```

## 📊 Diagram Management Tools

### `create_diagram`

Creates a new diagram in DiagramAI.

**Arguments:**
```typescript
{
  name: string;           // Required: Diagram name
  description?: string;   // Optional: Diagram description
}
```

**Response:**
```json
{
  "success": true,
  "diagram": {
    "uuid": "diagram_uuid_here",
    "name": "My Diagram",
    "description": "Diagram description",
    "nodes": [],
    "edges": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example:**
```typescript
const result = await client.callTool({
  name: 'create_diagram',
  arguments: {
    name: 'System Architecture',
    description: 'High-level system architecture diagram'
  }
});
```

### `read_diagram`

Retrieves complete diagram data including all nodes and edges.

**Arguments:**
```typescript
{
  diagram_uuid: string;   // Required: Diagram UUID
}
```

**Response:**
```json
{
  "success": true,
  "diagram": {
    "uuid": "diagram_uuid_here",
    "name": "My Diagram",
    "description": "Diagram description",
    "nodes": [
      {
        "id": "node_1",
        "type": "default",
        "position": { "x": 100, "y": 100 },
        "data": {
          "label": "Node Label",
          "description": "Node description",
          "color": "#3b82f6"
        }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2",
        "type": "smoothstep",
        "animated": false,
        "label": "Edge Label"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `list_diagrams`

Lists all available diagrams.

**Arguments:** None

**Response:**
```json
{
  "success": true,
  "diagrams": [
    {
      "uuid": "diagram_1",
      "name": "Diagram 1",
      "description": "First diagram",
      "nodeCount": 5,
      "edgeCount": 4,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### `delete_diagram`

Permanently deletes a diagram and all its nodes and edges.

**Arguments:**
```typescript
{
  diagram_uuid: string;   // Required: Diagram UUID to delete
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagram deleted successfully",
  "deletedDiagram": {
    "uuid": "diagram_uuid_here",
    "name": "Deleted Diagram"
  }
}
```

## 🔵 Node Management Tools

### `add_node`

Adds a new node to an existing diagram.

**Arguments:**
```typescript
{
  diagram_uuid: string;   // Required: Target diagram UUID
  node_data: {
    type?: string;        // Optional: Node type (default: 'default')
    position: {           // Required: Node position
      x: number;
      y: number;
    };
    data: {               // Required: Node data
      label: string;      // Required: Node label
      description?: string;
      color?: string;     // Hex color code
      icon?: string;      // Icon/emoji
      [key: string]: any; // Additional custom data
    };
  };
}
```

**Response:**
```json
{
  "success": true,
  "node": {
    "id": "generated_node_id",
    "type": "default",
    "position": { "x": 100, "y": 100 },
    "data": {
      "label": "New Node",
      "description": "Node description",
      "color": "#3b82f6"
    }
  }
}
```

**Example:**
```typescript
await client.callTool({
  name: 'add_node',
  arguments: {
    diagram_uuid: 'my-diagram-uuid',
    node_data: {
      type: 'cloud',
      position: { x: 200, y: 150 },
      data: {
        label: 'Cloud Service',
        description: 'AWS Lambda Function',
        color: '#f59e0b',
        icon: '☁️'
      }
    }
  }
});
```

### `update_node`

Updates an existing node's properties.

**Arguments:**
```typescript
{
  diagram_uuid: string;   // Required: Target diagram UUID
  node_id: string;        // Required: Node ID to update
  updates: {              // Required: Updates to apply
    position?: {
      x?: number;
      y?: number;
    };
    data?: {
      label?: string;
      description?: string;
      color?: string;
      icon?: string;
      [key: string]: any;
    };
    type?: string;
  };
}
```

**Response:**
```json
{
  "success": true,
  "node": {
    "id": "node_id",
    "type": "default",
    "position": { "x": 150, "y": 200 },
    "data": {
      "label": "Updated Node",
      "description": "Updated description",
      "color": "#ef4444"
    }
  }
}
```

## 🔗 Edge Management Tools

### `add_edge`

Creates a connection between two nodes.

**Arguments:**
```typescript
{
  diagram_uuid: string;   // Required: Target diagram UUID
  source_id: string;      // Required: Source node ID
  target_id: string;      // Required: Target node ID
  edge_data?: {           // Optional: Edge configuration
    type?: string;        // Edge type: 'default', 'straight', 'step', 'smoothstep'
    animated?: boolean;   // Whether edge is animated
    label?: string;       // Edge label
    style?: {             // Edge styling
      stroke?: string;
      strokeWidth?: number;
      strokeDasharray?: string;
    };
    markerEnd?: {         // Arrow marker configuration
      type: string;
      color?: string;
    };
    [key: string]: any;   // Additional custom data
  };
}
```

**Response:**
```json
{
  "success": true,
  "edge": {
    "id": "generated_edge_id",
    "source": "source_node_id",
    "target": "target_node_id",
    "type": "smoothstep",
    "animated": true,
    "label": "Connection",
    "style": {
      "stroke": "#6b7280",
      "strokeWidth": 2
    }
  }
}
```

**Example:**
```typescript
await client.callTool({
  name: 'add_edge',
  arguments: {
    diagram_uuid: 'my-diagram-uuid',
    source_id: 'node_1',
    target_id: 'node_2',
    edge_data: {
      type: 'smoothstep',
      animated: true,
      label: 'Data Flow',
      style: {
        stroke: '#10b981',
        strokeWidth: 3
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#10b981'
      }
    }
  }
});
```

### `update_edge`

Updates an existing edge's properties.

**Arguments:**
```typescript
{
  diagram_uuid: string;   // Required: Target diagram UUID
  edge_id: string;        // Required: Edge ID to update
  updates: {              // Required: Updates to apply
    type?: string;
    animated?: boolean;
    label?: string;
    style?: {
      stroke?: string;
      strokeWidth?: number;
      strokeDasharray?: string;
    };
    markerEnd?: {
      type: string;
      color?: string;
    };
    [key: string]: any;
  };
}
```

## 🎨 Node Types

DiagramAI supports various node types:

| Type | Description | Use Case |
|------|-------------|----------|
| `default` | Standard rectangular node | General purpose |
| `cloud` | Cloud-shaped node | Cloud services, external systems |
| `database` | Database cylinder node | Data storage |
| `process` | Diamond-shaped node | Decision points, processes |
| `input` | Input/output node | Data inputs/outputs |

## 🎯 Edge Types

Available edge types for connections:

| Type | Description | Visual |
|------|-------------|--------|
| `default` | Bezier curve | Smooth curved line |
| `straight` | Straight line | Direct connection |
| `step` | Step line | Right-angled connection |
| `smoothstep` | Smooth step | Rounded right-angled |

## 🔄 Real-time Features

### Conflict Resolution

When multiple agents or users edit simultaneously:

1. **Automatic Detection**: Conflicts detected within 5-second window
2. **Resolution Strategies**: 
   - Last Write Wins (default)
   - User Priority (user changes override agent changes)
   - Operational Transform (merge compatible changes)
3. **Event Queuing**: Failed operations automatically retried

### Live Collaboration

- **Instant Updates**: Changes appear immediately in web interface
- **Cursor Tracking**: See where other agents are working
- **Change Notifications**: Real-time notifications of modifications

## ⚠️ Error Handling

### Common Error Responses

```json
{
  "success": false,
  "error": {
    "code": "DIAGRAM_NOT_FOUND",
    "message": "Diagram with UUID 'invalid-uuid' not found",
    "details": {
      "diagram_uuid": "invalid-uuid"
    }
  }
}
```

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `AUTHENTICATION_FAILED` | Invalid API key | Check API key configuration |
| `DIAGRAM_NOT_FOUND` | Diagram doesn't exist | Verify diagram UUID |
| `NODE_NOT_FOUND` | Node doesn't exist | Verify node ID |
| `EDGE_NOT_FOUND` | Edge doesn't exist | Verify edge ID |
| `INVALID_POSITION` | Invalid node position | Check x,y coordinates |
| `DUPLICATE_EDGE` | Edge already exists | Check source/target IDs |
| `VALIDATION_ERROR` | Invalid input data | Check required fields |

## 🚀 Performance Tips

1. **Batch Operations**: Group multiple node/edge additions
2. **Efficient Queries**: Use `list_diagrams` to get overview before `read_diagram`
3. **Connection Pooling**: Reuse MCP client connections
4. **Error Handling**: Implement retry logic for network issues

## 📝 Examples

See the [MCP Agent Setup Guide](./MCP_AGENT_SETUP_GUIDE.md) for complete working examples.

---

**Need Help?** Check the [Troubleshooting Guide](./TROUBLESHOOTING.md) or [Deployment Guide](./DEPLOYMENT_GUIDE.md).
