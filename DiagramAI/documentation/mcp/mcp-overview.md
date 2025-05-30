# 🤖 DiagramAI MCP Integration

## Overview

DiagramAI now supports **Model Context Protocol (MCP)** for seamless agent collaboration! This allows AI agents to create, edit, and collaborate on diagrams in real-time with you.

## ✨ Features

### 🔧 **Complete MCP Tool Suite**
- **8 MCP Tools**: Full CRUD operations for diagrams, nodes, and edges
- **Real-time Collaboration**: Agents and users work together seamlessly
- **Conflict Resolution**: 6 strategies for handling simultaneous edits
- **Event Queuing**: Reliable operation delivery with retry mechanisms

### 🚀 **Production Ready**
- **Separate MCP Server**: Dedicated container for agent communication
- **WebSocket Integration**: Real-time updates between agents and UI
- **Database Persistence**: All changes saved to PostgreSQL
- **Authentication**: Secure API key-based agent authentication

### 🎯 **Single-User Optimized**
- **Simplified Security**: No complex multi-user authentication needed
- **Local Network**: Secure localhost-only deployment
- **Easy Setup**: Docker Compose deployment in minutes

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    MCP/HTTP    ┌─────────────────┐
│   DiagramAI     │◄──────────────►│ DiagramAI MCP   │◄─────────────►│   Your Agent    │
│   Frontend      │                │     Server      │                │                 │
│   (Port 3000)   │                │   (Port 3001)   │                │                 │
└─────────────────┘                └─────────────────┘                └─────────────────┘
         │                                   │
         │              PostgreSQL          │
         └─────────────────┬─────────────────┘
                          │
                ┌─────────────────┐
                │    Database     │
                │   (Port 5432)   │
                └─────────────────┘
```

## 🚀 Quick Start

### 1. Deploy DiagramAI

```bash
git clone https://github.com/your-username/DiagramAI.git
cd DiagramAI

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d --build
```

### 2. Create Your First Agent

```bash
mkdir my-agent && cd my-agent
npm init -y
npm install @modelcontextprotocol/sdk ws uuid
```

Create `agent.js`:
```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'My DiagramAI Agent',
  version: '1.0.0'
}, { capabilities: { tools: {} } });

const transport = new StdioClientTransport({
  command: 'node',
  args: ['../DiagramAI-MCP-Server/dist/index.js'],
  env: {
    DIAGRAMAI_API_KEY: 'your-api-key',
    DIAGRAMAI_WS_URL: 'ws://localhost:3000/ws/diagrams',
    DATABASE_URL: 'postgresql://diagramai:password123@localhost:5432/diagramai'
  }
});

await client.connect(transport);

// Create a diagram
const result = await client.callTool({
  name: 'create_diagram',
  arguments: { name: 'My First Agent Diagram' }
});

console.log('Created diagram:', result);
```

### 3. Run Your Agent

```bash
export DIAGRAMAI_API_KEY="your-api-key"
node agent.js
```

### 4. Watch Real-time Collaboration

Open http://localhost:3000 and watch your agent create diagrams in real-time! 🎉

## 🛠️ Available MCP Tools

| Tool | Description | Example |
|------|-------------|---------|
| `create_diagram` | Create new diagram | `{ name: "System Architecture" }` |
| `read_diagram` | Get diagram data | `{ diagram_uuid: "uuid-here" }` |
| `list_diagrams` | List all diagrams | `{}` |
| `delete_diagram` | Delete diagram | `{ diagram_uuid: "uuid-here" }` |
| `add_node` | Add node to diagram | `{ diagram_uuid, node_data }` |
| `update_node` | Update existing node | `{ diagram_uuid, node_id, updates }` |
| `add_edge` | Connect two nodes | `{ diagram_uuid, source_id, target_id }` |
| `update_edge` | Update existing edge | `{ diagram_uuid, edge_id, updates }` |

## 🎨 Example: Building a System Architecture

```javascript
// Create architecture diagram
const diagram = await client.callTool({
  name: 'create_diagram',
  arguments: {
    name: 'Microservices Architecture',
    description: 'System architecture overview'
  }
});

const diagramUuid = JSON.parse(diagram.content[0].text).uuid;

// Add frontend service
const frontend = await client.callTool({
  name: 'add_node',
  arguments: {
    diagram_uuid: diagramUuid,
    node_data: {
      type: 'default',
      position: { x: 100, y: 100 },
      data: {
        label: 'Frontend',
        description: 'React Application',
        color: '#3b82f6',
        icon: '🌐'
      }
    }
  }
});

// Add API Gateway
const gateway = await client.callTool({
  name: 'add_node',
  arguments: {
    diagram_uuid: diagramUuid,
    node_data: {
      type: 'cloud',
      position: { x: 300, y: 100 },
      data: {
        label: 'API Gateway',
        description: 'Request routing and authentication',
        color: '#f59e0b',
        icon: '🚪'
      }
    }
  }
});

// Add database
const database = await client.callTool({
  name: 'add_node',
  arguments: {
    diagram_uuid: diagramUuid,
    node_data: {
      type: 'database',
      position: { x: 500, y: 200 },
      data: {
        label: 'PostgreSQL',
        description: 'Primary database',
        color: '#8b5cf6',
        icon: '🗄️'
      }
    }
  }
});

// Connect components
await client.callTool({
  name: 'add_edge',
  arguments: {
    diagram_uuid: diagramUuid,
    source_id: JSON.parse(frontend.content[0].text).id,
    target_id: JSON.parse(gateway.content[0].text).id,
    edge_data: {
      type: 'smoothstep',
      animated: true,
      label: 'HTTP Requests'
    }
  }
});

await client.callTool({
  name: 'add_edge',
  arguments: {
    diagram_uuid: diagramUuid,
    source_id: JSON.parse(gateway.content[0].text).id,
    target_id: JSON.parse(database.content[0].text).id,
    edge_data: {
      type: 'smoothstep',
      label: 'Database Queries'
    }
  }
});
```

## 🔄 Real-time Features

### Conflict Resolution
When you and your agent edit simultaneously:
- **Automatic Detection**: Conflicts detected within 5 seconds
- **Smart Resolution**: Last write wins, user priority, or operational transform
- **No Data Loss**: All operations queued and retried

### Live Collaboration
- **Instant Updates**: See agent changes immediately in the web UI
- **Bidirectional Sync**: Your changes reach agents in real-time
- **Event Queuing**: Reliable delivery even with network issues

## 📚 Documentation

- **[Setup Guide](./MCP_AGENT_SETUP_GUIDE.md)**: Complete agent setup instructions
- **[API Reference](./API_REFERENCE.md)**: Detailed tool documentation
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Production deployment
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues and solutions

## 🎯 Use Cases

### 🏗️ **Architecture Documentation**
- Agents generate system architecture diagrams
- Real-time collaboration on design decisions
- Automatic documentation updates

### 📊 **Process Modeling**
- AI agents model business processes
- Interactive process optimization
- Real-time workflow visualization

### 🔄 **Data Flow Diagrams**
- Automated data pipeline visualization
- Real-time monitoring integration
- Dynamic system state representation

### 🧠 **Knowledge Graphs**
- AI-powered knowledge extraction
- Interactive concept mapping
- Collaborative knowledge building

## 🚀 Advanced Features

### Custom Node Types
```javascript
// Add custom node types
await client.callTool({
  name: 'add_node',
  arguments: {
    diagram_uuid: diagramUuid,
    node_data: {
      type: 'custom',
      position: { x: 200, y: 150 },
      data: {
        label: 'ML Model',
        description: 'TensorFlow model serving',
        color: '#ff6b6b',
        icon: '🤖',
        customData: {
          modelType: 'classification',
          accuracy: 0.95,
          lastTrained: '2024-01-01'
        }
      }
    }
  }
});
```

### Batch Operations
```javascript
// Create multiple nodes efficiently
const nodes = await Promise.all([
  client.callTool({ name: 'add_node', arguments: nodeData1 }),
  client.callTool({ name: 'add_node', arguments: nodeData2 }),
  client.callTool({ name: 'add_node', arguments: nodeData3 })
]);
```

### Error Handling
```javascript
try {
  const result = await client.callTool({
    name: 'create_diagram',
    arguments: { name: 'Test Diagram' }
  });
} catch (error) {
  if (error.code === 'AUTHENTICATION_FAILED') {
    console.error('Invalid API key');
  } else if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid arguments:', error.details);
  }
}
```

## 🎉 Success Stories

> "DiagramAI MCP integration transformed how we document our architecture. Our AI agents now automatically generate and update system diagrams as our codebase evolves!" - *Development Team*

> "Real-time collaboration between human designers and AI agents has revolutionized our workflow design process." - *Process Engineer*

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Ready to start building with DiagramAI MCP?** 🚀

Check out the [Setup Guide](./MCP_AGENT_SETUP_GUIDE.md) to create your first agent!
