# 🤖 DiagramAI MCP Agent Setup Guide

## Overview

This guide explains how to create and connect MCP (Model Context Protocol) agents to DiagramAI for real-time diagram collaboration. MCP agents can create, read, edit, and delete diagrams programmatically while collaborating with you in real-time.

## 📋 Prerequisites

- DiagramAI application running (see [Deployment Guide](./DEPLOYMENT_GUIDE.md))
- Node.js 18+ installed
- Basic understanding of MCP (Model Context Protocol)
- API key for DiagramAI MCP server

## 🏗️ Architecture Overview

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP/MCP    ┌─────────────────┐
│   DiagramAI     │◄──────────────►│ DiagramAI MCP   │◄─────────────►│   MCP Agent     │
│   Frontend      │                │     Server      │                │  (Your Code)    │
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

## 🔑 Step 1: Get API Key

### Option A: Environment Variable (Recommended)
1. Set the API key in your environment:
```bash
export DIAGRAMAI_API_KEY="your-api-key-here"
```

### Option B: Database Setup
1. Connect to your PostgreSQL database
2. Insert an API key record:
```sql
INSERT INTO "AgentCredential" (
  id, 
  name, 
  "apiKey", 
  permissions, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  'agent-1',
  'My MCP Agent',
  'your-hashed-api-key',
  '{"diagrams": ["create", "read", "update", "delete"], "nodes": ["create", "read", "update", "delete"], "edges": ["create", "read", "update", "delete"]}',
  true,
  NOW(),
  NOW()
);
```

## 🚀 Step 2: Create Your MCP Agent

### Basic MCP Agent Structure

Create a new directory for your agent:
```bash
mkdir my-diagramai-agent
cd my-diagramai-agent
npm init -y
```

Install required dependencies:
```bash
npm install @modelcontextprotocol/sdk ws uuid
npm install -D @types/node @types/ws typescript
```

Set up .gitignore (IMPORTANT for security):
```bash
# Copy the provided template
cp ../DiagramAI/docs/agent-gitignore-template .gitignore

# Or create manually to protect API keys
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.key
*.log
secrets/
.secrets
EOF
```

### Basic Agent Implementation

Create `src/agent.ts`:
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class DiagramAIAgent {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['path/to/diagramai-mcp-server/dist/index.js'],
      env: {
        ...process.env,
        DIAGRAMAI_API_KEY: process.env.DIAGRAMAI_API_KEY,
        DIAGRAMAI_WS_URL: 'ws://localhost:3000/ws/diagrams',
        DIAGRAMAI_DB_URL: process.env.DATABASE_URL
      }
    });
    
    this.client = new Client({
      name: 'DiagramAI Agent',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport);
    console.log('🔗 Connected to DiagramAI MCP Server');
  }

  async createDiagram(name: string, description?: string): Promise<string> {
    const result = await this.client.callTool({
      name: 'create_diagram',
      arguments: {
        name,
        description: description || `Diagram created by agent at ${new Date().toISOString()}`
      }
    });
    
    console.log('📊 Created diagram:', result);
    return result.content[0].text;
  }

  async addNode(diagramUuid: string, nodeData: any): Promise<string> {
    const result = await this.client.callTool({
      name: 'add_node',
      arguments: {
        diagram_uuid: diagramUuid,
        node_data: nodeData
      }
    });
    
    console.log('🔵 Added node:', result);
    return result.content[0].text;
  }

  async addEdge(diagramUuid: string, sourceId: string, targetId: string, edgeData?: any): Promise<string> {
    const result = await this.client.callTool({
      name: 'add_edge',
      arguments: {
        diagram_uuid: diagramUuid,
        source_id: sourceId,
        target_id: targetId,
        edge_data: edgeData || {}
      }
    });
    
    console.log('🔗 Added edge:', result);
    return result.content[0].text;
  }

  async listDiagrams(): Promise<any[]> {
    const result = await this.client.callTool({
      name: 'list_diagrams',
      arguments: {}
    });
    
    const diagrams = JSON.parse(result.content[0].text);
    console.log('📋 Available diagrams:', diagrams.length);
    return diagrams;
  }

  async readDiagram(diagramUuid: string): Promise<any> {
    const result = await this.client.callTool({
      name: 'read_diagram',
      arguments: {
        diagram_uuid: diagramUuid
      }
    });
    
    const diagram = JSON.parse(result.content[0].text);
    console.log('📖 Read diagram:', diagram.name);
    return diagram;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log('🔌 Disconnected from DiagramAI MCP Server');
  }
}

export { DiagramAIAgent };
```

### Example Usage Script

Create `src/example.ts`:
```typescript
import { DiagramAIAgent } from './agent.js';

async function main() {
  const agent = new DiagramAIAgent();
  
  try {
    // Connect to DiagramAI
    await agent.connect();
    
    // Create a new diagram
    const diagramResult = await agent.createDiagram(
      'My Agent Diagram',
      'A diagram created by my MCP agent'
    );
    const diagram = JSON.parse(diagramResult);
    const diagramUuid = diagram.uuid;
    
    // Add some nodes
    const node1Result = await agent.addNode(diagramUuid, {
      type: 'default',
      position: { x: 100, y: 100 },
      data: {
        label: 'Start Node',
        description: 'Starting point of the process',
        color: '#10b981'
      }
    });
    const node1 = JSON.parse(node1Result);
    
    const node2Result = await agent.addNode(diagramUuid, {
      type: 'default',
      position: { x: 300, y: 100 },
      data: {
        label: 'End Node',
        description: 'End point of the process',
        color: '#ef4444'
      }
    });
    const node2 = JSON.parse(node2Result);
    
    // Connect the nodes with an edge
    await agent.addEdge(diagramUuid, node1.id, node2.id, {
      type: 'smoothstep',
      animated: true,
      label: 'Process Flow'
    });
    
    // Read the complete diagram
    const completeDiagram = await agent.readDiagram(diagramUuid);
    console.log('✅ Complete diagram:', completeDiagram);
    
    // List all diagrams
    const allDiagrams = await agent.listDiagrams();
    console.log('📊 Total diagrams:', allDiagrams.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await agent.disconnect();
  }
}

// Run the example
main().catch(console.error);
```

## 🔧 Step 3: Configuration

### TypeScript Configuration

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json Scripts

Update your `package.json`:
```json
{
  "name": "my-diagramai-agent",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/example.js",
    "dev": "tsc && node dist/example.js",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "ws": "^8.14.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/ws": "^8.5.0",
    "typescript": "^5.0.0"
  }
}
```

## 🏃‍♂️ Step 4: Running Your Agent

1. **Build the agent:**
```bash
npm run build
```

2. **Set environment variables:**
```bash
export DIAGRAMAI_API_KEY="your-api-key"
export DATABASE_URL="postgresql://user:password@localhost:5432/diagramai"
```

3. **Start DiagramAI (if not running):**
```bash
cd DiagramAI
docker-compose up -d
```

4. **Run your agent:**
```bash
npm start
```

## 📡 Step 5: Real-time Collaboration

Your agent will automatically collaborate with you in real-time! When your agent makes changes:

1. **Immediate Updates**: Changes appear instantly in the DiagramAI web interface
2. **Conflict Resolution**: If you and the agent edit simultaneously, conflicts are resolved automatically
3. **Event Queuing**: All operations are queued and retried if network issues occur
4. **Live Sync**: You can see your agent working in real-time

## 🛠️ Available MCP Tools

Your agent has access to these tools:

| Tool | Description | Arguments |
|------|-------------|-----------|
| `create_diagram` | Create a new diagram | `name`, `description?` |
| `read_diagram` | Read diagram data | `diagram_uuid` |
| `list_diagrams` | List all diagrams | None |
| `delete_diagram` | Delete a diagram | `diagram_uuid` |
| `add_node` | Add node to diagram | `diagram_uuid`, `node_data` |
| `update_node` | Update existing node | `diagram_uuid`, `node_id`, `updates` |
| `add_edge` | Add edge between nodes | `diagram_uuid`, `source_id`, `target_id`, `edge_data?` |
| `update_edge` | Update existing edge | `diagram_uuid`, `edge_id`, `updates` |

## 🔍 Debugging & Troubleshooting

### Common Issues

1. **Connection Failed**: Check if DiagramAI MCP server is running on port 3001
2. **Authentication Error**: Verify your API key is correct
3. **Database Error**: Ensure PostgreSQL is running and accessible
4. **WebSocket Error**: Check if DiagramAI frontend is running on port 3000

### Debug Logging

Enable debug logging in your agent:
```typescript
// Add to your agent constructor
console.log('🔧 Debug mode enabled');
process.env.DEBUG = 'mcp:*';
```

### Health Check

Test your connection:
```bash
curl http://localhost:3001/health
```

## 🎯 Next Steps

1. **Explore Advanced Features**: Try conflict resolution by editing simultaneously
2. **Build Complex Workflows**: Create multi-step diagram generation processes
3. **Add Error Handling**: Implement robust error handling and retry logic
4. **Scale Up**: Create multiple agents for different diagram types

## 📚 Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [DiagramAI API Reference](./API_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Happy Diagramming! 🎨🤖**
