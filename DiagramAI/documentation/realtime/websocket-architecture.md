# WebSocket Service Architecture

## Overview
The WebSocket service enables real-time communication between DiagramAI and MCP agents, allowing for live collaboration and instant synchronization of diagram changes.

## Architecture Components

### 1. DiagramWebSocketService
- **Location**: `src/services/websocketService.ts`
- **Purpose**: Core WebSocket server managing connections and message routing
- **Port**: Integrated with Next.js server on `/ws/diagrams` path

### 2. Connection Management
- **Agent Connections**: Map of agent IDs to WebSocket connections
- **User Connections**: Map of user sessions to WebSocket connections
- **Diagram Subscriptions**: Track which connections are subscribed to which diagrams

### 3. Message Types

#### Agent → DiagramAI
```typescript
interface AgentMessage {
  type: 'agent_operation'
  diagram_uuid: string
  operation: 'create_diagram' | 'add_node' | 'update_node' | 'delete_node' | 'add_edge' | 'delete_edge'
  data: any
  agent_id: string
  request_id: string
}
```

#### DiagramAI → Agent/User
```typescript
interface DiagramUpdate {
  type: 'diagram_updated'
  diagram_uuid: string
  changes: OperationChange[]
  updated_by: 'user' | 'agent'
  timestamp: string
}
```

#### Connection Management
```typescript
interface ConnectionMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'pong'
  diagram_uuid?: string
  agent_id?: string
}
```

## Security Considerations
- Agent authentication via API keys
- Rate limiting per connection
- Message validation and sanitization
- Diagram access control enforcement

## Error Handling
- Connection timeout management
- Automatic reconnection logic
- Graceful degradation when WebSocket unavailable
- Error propagation to MCP clients

## Performance Optimizations
- Message batching for high-frequency updates
- Connection pooling
- Subscription-based broadcasting
- Memory-efficient connection tracking
