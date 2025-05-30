# DiagramAI REST API Reference

*Last Updated: December 30, 2024*

## Overview

DiagramAI provides a comprehensive REST API for diagram management, real-time collaboration, and AI integration. All endpoints support JSON request/response format and include real-time WebSocket broadcasting.

## Base URL

```
Production: https://diagramai.example.com/api
Development: http://localhost:3001/api
```

## Authentication

Currently, DiagramAI operates as a single-user application. Future versions will include:
- API key authentication
- JWT token-based sessions
- Role-based access control

## Diagram Management

### GET /api/diagrams

List all diagrams with pagination and filtering.

**Parameters:**
```typescript
{
  limit?: number;     // Default: 20, Max: 100
  offset?: number;    // Default: 0
  search?: string;    // Search in title/description
  format?: 'mermaid' | 'reactflow' | 'all'; // Default: 'all'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "diagrams": [
      {
        "id": "f50ff3c6-f439-4952-9370-49d686372c22",
        "title": "System Architecture",
        "description": "High-level system overview",
        "format": "mermaid",
        "isPublic": true,
        "createdAt": "2024-12-30T00:00:00.000Z",
        "updatedAt": "2024-12-30T09:34:00.349Z"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

### GET /api/diagrams/[id]

Retrieve a specific diagram by ID.

**Parameters:**
- `id` (string): Diagram UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "f50ff3c6-f439-4952-9370-49d686372c22",
    "title": "System Architecture",
    "description": "High-level system overview",
    "content": "graph TD\n    A[Frontend] --> B[Backend]\n    B --> C[Database]",
    "format": "mermaid",
    "tags": ["architecture", "system"],
    "isPublic": true,
    "createdAt": "2024-12-30T00:00:00.000Z",
    "updatedAt": "2024-12-30T09:34:00.349Z"
  }
}
```

### POST /api/diagrams

Create a new diagram.

**Request Body:**
```json
{
  "title": "New Diagram",
  "description": "Diagram description",
  "content": "graph TD\n    A --> B",
  "format": "mermaid",
  "tags": ["new", "example"],
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-diagram-uuid",
    "title": "New Diagram",
    "description": "Diagram description",
    "content": "graph TD\n    A --> B",
    "format": "mermaid",
    "tags": ["new", "example"],
    "isPublic": false,
    "createdAt": "2024-12-30T10:00:00.000Z",
    "updatedAt": "2024-12-30T10:00:00.000Z"
  }
}
```

### PUT /api/diagrams/[id]

Update an existing diagram. **Triggers real-time WebSocket broadcast.**

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "content": "graph TD\n    A[Updated] --> B[Content]",
  "tags": ["updated"],
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "f50ff3c6-f439-4952-9370-49d686372c22",
    "title": "Updated Title",
    "description": "Updated description",
    "content": "graph TD\n    A[Updated] --> B[Content]",
    "format": "mermaid",
    "tags": ["updated"],
    "isPublic": true,
    "createdAt": "2024-12-30T00:00:00.000Z",
    "updatedAt": "2024-12-30T10:05:00.000Z"
  }
}
```

**Real-time Broadcast:**
When content is updated, a WebSocket message is broadcast to all subscribers:
```json
{
  "type": "diagram_updated",
  "diagram_uuid": "f50ff3c6-f439-4952-9370-49d686372c22",
  "changes": [{
    "type": "content_updated",
    "content": "graph TD\n    A[Updated] --> B[Content]",
    "timestamp": "2024-12-30T10:05:00.000Z"
  }],
  "updated_by": "user",
  "timestamp": "2024-12-30T10:05:00.000Z"
}
```

### DELETE /api/diagrams/[id]

Delete a diagram permanently.

**Parameters:**
- `id` (string): Diagram UUID

**Response:**
```json
{
  "success": true,
  "message": "Diagram deleted successfully",
  "data": {
    "id": "f50ff3c6-f439-4952-9370-49d686372c22",
    "title": "Deleted Diagram"
  }
}
```

## Settings Management

### GET /api/settings

Retrieve user settings and API key status.

**Response:**
```json
{
  "success": true,
  "data": {
    "openai": {
      "hasKey": true,
      "keyPreview": "sk-...abc123",
      "models": ["gpt-4", "gpt-3.5-turbo"]
    },
    "anthropic": {
      "hasKey": false,
      "keyPreview": null,
      "models": []
    },
    "openrouter": {
      "hasKey": true,
      "keyPreview": "sk-or-...xyz789",
      "models": ["claude-3-opus", "gpt-4"]
    }
  }
}
```

### POST /api/settings

Update API keys and settings.

**Request Body:**
```json
{
  "openaiKey": "sk-new-openai-key",
  "anthropicKey": "sk-ant-new-key",
  "openrouterKey": "sk-or-new-key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "openai": {
      "hasKey": true,
      "keyPreview": "sk-...key",
      "models": ["gpt-4", "gpt-3.5-turbo"]
    },
    "anthropic": {
      "hasKey": true,
      "keyPreview": "sk-ant-...key",
      "models": ["claude-3-opus", "claude-3-sonnet"]
    },
    "openrouter": {
      "hasKey": true,
      "keyPreview": "sk-or-...key",
      "models": ["claude-3-opus", "gpt-4"]
    }
  }
}
```

## Health & Status

### GET /api/health

System health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-30T10:00:00.000Z",
    "version": "1.0.0",
    "services": {
      "database": "connected",
      "websocket": "active",
      "ai_providers": {
        "openai": "available",
        "anthropic": "available",
        "openrouter": "available"
      }
    },
    "metrics": {
      "active_connections": 5,
      "total_diagrams": 42,
      "uptime": "2h 30m"
    }
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "DIAGRAM_NOT_FOUND",
    "message": "Diagram with ID 'invalid-id' not found",
    "details": {
      "diagramId": "invalid-id",
      "timestamp": "2024-12-30T10:00:00.000Z"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `DIAGRAM_NOT_FOUND` | 404 | Diagram doesn't exist |
| `INVALID_REQUEST` | 400 | Malformed request body |
| `VALIDATION_ERROR` | 422 | Data validation failed |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMITED` | 429 | Too many requests |

## Rate Limiting

Current rate limits (per IP address):
- **General API**: 100 requests per minute
- **Diagram Updates**: 30 requests per minute
- **Settings Updates**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Real-time Integration

### WebSocket Triggers
The following API endpoints trigger WebSocket broadcasts:

1. **PUT /api/diagrams/[id]** - Content updates
2. **DELETE /api/diagrams/[id]** - Diagram deletion
3. **POST /api/diagrams** - New diagram creation

### Broadcast Format
```typescript
interface DiagramUpdate {
  type: 'diagram_updated' | 'diagram_created' | 'diagram_deleted'
  diagram_uuid: string
  changes: OperationChange[]
  updated_by: 'user' | 'agent'
  timestamp: string
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
// Fetch diagram
const response = await fetch('/api/diagrams/diagram-id')
const { data } = await response.json()

// Update diagram with real-time broadcast
const updateResponse = await fetch('/api/diagrams/diagram-id', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'graph TD\n    A --> B'
  })
})
```

### cURL Examples
```bash
# Get all diagrams
curl -X GET "http://localhost:3001/api/diagrams"

# Update diagram (triggers WebSocket broadcast)
curl -X PUT "http://localhost:3001/api/diagrams/diagram-id" \
  -H "Content-Type: application/json" \
  -d '{"content": "graph TD\n    A --> B"}'

# Health check
curl -X GET "http://localhost:3001/api/health"
```

---

**Note**: All diagram update operations automatically trigger real-time WebSocket broadcasts to connected clients, enabling seamless collaborative editing with 11ms latency.
