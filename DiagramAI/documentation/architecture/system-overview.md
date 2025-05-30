# DiagramAI System Architecture Overview

*Last Updated: December 30, 2024*

## High-Level Architecture

DiagramAI is a modern, real-time collaborative diagram editor built with Next.js, featuring dual editing modes (ReactFlow and Mermaid), WebSocket-based real-time collaboration, and comprehensive AI integration.

```
┌─────────────────────────────────────────────────────────────────┐
│                        DiagramAI System                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/Next.js)          │  Backend (Next.js API)     │
│  ┌─────────────────────────────────┐│  ┌─────────────────────────┐│
│  │ • ReactFlow Editor              ││  │ • REST API Endpoints    ││
│  │ • Mermaid Editor                ││  │ • WebSocket Service     ││
│  │ • Real-time Collaboration      ││  │ • AI Integration        ││
│  │ • Settings Management          ││  │ • Database Layer        ││
│  └─────────────────────────────────┘│  └─────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                    Real-time Layer (WebSocket)                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • 11ms Latency • Multi-user Support • Conflict Resolution ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL/Prisma)      │  External Services          │
│  ┌─────────────────────────────────┐│  ┌─────────────────────────┐│
│  │ • Diagram Storage               ││  │ • OpenAI API            ││
│  │ • User Management               ││  │ • Anthropic API         ││
│  │ • Settings & Configuration     ││  │ • OpenRouter API        ││
│  └─────────────────────────────────┘│  └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### Frontend Architecture

#### 1. Diagram Editors
- **ReactFlow Editor**: Visual drag-and-drop interface
  - Interactive node manipulation
  - Real-time collaboration
  - Custom node types and styling
  - Export/import capabilities

- **Mermaid Editor**: Text-based diagram creation
  - Live syntax preview
  - Resizable panels
  - Syntax highlighting
  - Error validation

#### 2. Real-time Collaboration
- **WebSocket Client**: `src/hooks/useWebSocket.ts`
- **Connection Management**: Automatic reconnection
- **Update Broadcasting**: Instant diagram synchronization
- **Conflict Resolution**: Multi-user editing support

#### 3. State Management
- **React Context**: Global application state
- **Local State**: Component-specific state
- **WebSocket State**: Real-time connection status
- **Persistence**: Local storage for settings

### Backend Architecture

#### 1. API Layer
- **REST Endpoints**: `/src/pages/api/`
  - Diagram CRUD operations
  - Settings management
  - AI integration endpoints
  - Health checks and monitoring

#### 2. WebSocket Service
- **Real-time Communication**: `src/services/websocketService.ts`
- **Connection Management**: Multi-user support
- **Message Broadcasting**: Efficient update distribution
- **Performance**: 11ms latency achievement

#### 3. AI Integration
- **Multiple Providers**: OpenAI, Anthropic, OpenRouter
- **API Key Management**: Secure storage and validation
- **Response Caching**: Performance optimization
- **Error Handling**: Graceful fallbacks

### Data Layer

#### 1. Database Schema
- **Diagrams**: Content, metadata, versioning
- **Users**: Authentication, preferences
- **Settings**: API keys, configuration
- **Audit Logs**: Change tracking

#### 2. ORM Integration
- **Prisma**: Type-safe database operations
- **Migrations**: Schema version control
- **Indexing**: Performance optimization
- **Validation**: Data integrity

## Technology Stack

### Frontend Technologies
```typescript
{
  "framework": "Next.js 15.0.0+",
  "ui": "React 18.2.0+",
  "language": "TypeScript 5.0+",
  "diagramming": {
    "visual": "React Flow 12.6.0+",
    "textual": "Mermaid.js 11.0.0+"
  },
  "styling": "Tailwind CSS",
  "state": "React Context + Hooks"
}
```

### Backend Technologies
```typescript
{
  "runtime": "Node.js 18+",
  "framework": "Next.js API Routes",
  "database": "PostgreSQL 15+ (Prisma ORM)",
  "realtime": "WebSocket (ws library)",
  "ai": {
    "openai": "@openai/api 4.0+",
    "anthropic": "@anthropic-ai/sdk 0.24+",
    "openrouter": "Custom integration"
  }
}
```

### Development Tools
```typescript
{
  "testing": {
    "unit": "Jest 29.7.0+",
    "integration": "Jest + Supertest",
    "e2e": "Playwright 1.40.0+"
  },
  "quality": {
    "linting": "ESLint 8.57.0+",
    "formatting": "Prettier 3.2.0+",
    "types": "TypeScript 5.0+"
  },
  "deployment": {
    "containerization": "Docker",
    "orchestration": "Docker Compose"
  }
}
```

## Data Flow Architecture

### 1. User Interaction Flow
```
User Input → Component State → API Call → Database → Response → UI Update
```

### 2. Real-time Collaboration Flow
```
User A Edit → WebSocket → Server → Broadcast → User B Update
```

### 3. AI Integration Flow
```
User Request → API Validation → AI Provider → Response Processing → UI Display
```

## Security Architecture

### 1. Authentication & Authorization
- **API Key Management**: Encrypted storage
- **Session Management**: Secure token handling
- **Input Validation**: Comprehensive sanitization
- **CORS Configuration**: Controlled access

### 2. Data Protection
- **Encryption**: Sensitive data encryption
- **Validation**: Multi-layer input validation
- **Sanitization**: XSS prevention
- **Audit Logging**: Security event tracking

## Performance Architecture

### 1. Frontend Optimization
- **Code Splitting**: Lazy loading
- **Memoization**: React.memo optimization
- **Caching**: Component and data caching
- **Bundle Optimization**: Tree shaking

### 2. Backend Optimization
- **Connection Pooling**: Efficient resource usage
- **Message Batching**: Reduced network overhead
- **Caching Strategy**: Multi-layer caching
- **Database Indexing**: Query optimization

### 3. Real-time Optimization
- **WebSocket Efficiency**: 11ms latency
- **Message Compression**: Reduced bandwidth
- **Connection Management**: Scalable architecture
- **Error Recovery**: Automatic reconnection

## Scalability Considerations

### 1. Horizontal Scaling
- **Stateless Design**: Session-independent architecture
- **Load Balancing**: Traffic distribution
- **Database Sharding**: Data partitioning
- **CDN Integration**: Global content delivery

### 2. Vertical Scaling
- **Resource Optimization**: Efficient memory usage
- **CPU Optimization**: Performance tuning
- **Database Optimization**: Query performance
- **Caching Strategy**: Reduced database load

## Monitoring & Observability

### 1. Application Monitoring
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Exception monitoring
- **User Analytics**: Usage patterns
- **Health Checks**: System status monitoring

### 2. Infrastructure Monitoring
- **Resource Usage**: CPU, memory, disk
- **Network Performance**: Latency, bandwidth
- **Database Performance**: Query times, connections
- **WebSocket Metrics**: Connection count, message rates

## Future Architecture Evolution

### 1. Planned Enhancements
- **MCP Integration**: AI agent connectivity
- **Microservices**: Service decomposition
- **Event Sourcing**: Audit trail enhancement
- **CQRS**: Command-query separation

### 2. Scalability Improvements
- **Kubernetes**: Container orchestration
- **Message Queues**: Asynchronous processing
- **Event Streaming**: Real-time data pipelines
- **Edge Computing**: Global performance

---

**Summary**: DiagramAI's architecture provides a robust, scalable foundation for real-time collaborative diagram editing with industry-leading performance and comprehensive feature support.
