# ⚡ DiagramAI MCP Quick Start

## 🎯 Goal
Get DiagramAI running with MCP agent support in **under 10 minutes**!

## 📋 What You'll Need
- Docker and Docker Compose
- Node.js 18+ (for creating agents)
- 5 minutes of your time ⏰

## 🚀 Step 1: Deploy DiagramAI (2 minutes)

```bash
# Clone the repository
git clone https://github.com/your-username/DiagramAI.git
cd DiagramAI

# Create environment file
cat > .env << EOF
# Database
DATABASE_URL="postgresql://diagramai:password123@postgres:5432/diagramai"
POSTGRES_USER=diagramai
POSTGRES_PASSWORD=password123
POSTGRES_DB=diagramai

# MCP Configuration
DIAGRAMAI_API_KEY="quickstart-api-key-12345"
DIAGRAMAI_WS_URL="ws://localhost:3000/ws/diagrams"

# App Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
EOF

# Start everything
docker-compose up -d --build
```

**Wait for services to start** (about 1-2 minutes):
```bash
# Check status
docker-compose ps

# Wait for this message in logs:
docker-compose logs -f diagramai | grep "ready"
```

## 🌐 Step 2: Verify DiagramAI is Running (30 seconds)

Open your browser:
- **DiagramAI UI**: http://localhost:3000
- **MCP Server**: http://localhost:3001/health

You should see:
- ✅ DiagramAI interface loads
- ✅ MCP server returns `{"status": "healthy"}`

## 🤖 Step 3: Create Your First Agent (3 minutes)

```bash
# Create agent directory
mkdir my-first-agent && cd my-first-agent

# Initialize project
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk ws uuid

# Create .gitignore to protect API keys (IMPORTANT!)
cat > .gitignore << 'EOF'
node_modules/
.env
*.key
*.log
secrets/
EOF

# Create agent script
cat > agent.js << 'EOF'
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function createDiagram() {
  // Setup MCP client
  const client = new Client({
    name: 'My First DiagramAI Agent',
    version: '1.0.0'
  }, { capabilities: { tools: {} } });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['../DiagramAI-MCP-Server/dist/index.js'],
    env: {
      DIAGRAMAI_API_KEY: 'quickstart-api-key-12345',
      DIAGRAMAI_WS_URL: 'ws://localhost:3000/ws/diagrams',
      DATABASE_URL: 'postgresql://diagramai:password123@localhost:5432/diagramai'
    }
  });

  try {
    // Connect to DiagramAI
    await client.connect(transport);
    console.log('🔗 Connected to DiagramAI!');

    // Create a diagram
    const diagramResult = await client.callTool({
      name: 'create_diagram',
      arguments: {
        name: 'My First Agent Diagram',
        description: 'Created by my first MCP agent!'
      }
    });

    const diagram = JSON.parse(diagramResult.content[0].text);
    console.log('📊 Created diagram:', diagram.name);

    // Add a node
    const nodeResult = await client.callTool({
      name: 'add_node',
      arguments: {
        diagram_uuid: diagram.uuid,
        node_data: {
          type: 'default',
          position: { x: 200, y: 100 },
          data: {
            label: 'Hello from Agent!',
            description: 'This node was created by an MCP agent',
            color: '#10b981',
            icon: '🤖'
          }
        }
      }
    });

    const node = JSON.parse(nodeResult.content[0].text);
    console.log('🔵 Added node:', node.data.label);

    // Add another node
    const node2Result = await client.callTool({
      name: 'add_node',
      arguments: {
        diagram_uuid: diagram.uuid,
        node_data: {
          type: 'cloud',
          position: { x: 400, y: 100 },
          data: {
            label: 'Cloud Service',
            description: 'Connected to the first node',
            color: '#3b82f6',
            icon: '☁️'
          }
        }
      }
    });

    const node2 = JSON.parse(node2Result.content[0].text);

    // Connect the nodes
    await client.callTool({
      name: 'add_edge',
      arguments: {
        diagram_uuid: diagram.uuid,
        source_id: node.id,
        target_id: node2.id,
        edge_data: {
          type: 'smoothstep',
          animated: true,
          label: 'Agent Connection'
        }
      }
    });

    console.log('🔗 Connected nodes with animated edge');
    console.log('✅ Success! Check DiagramAI at http://localhost:3000');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

createDiagram();
EOF

# Update package.json for ES modules
cat > package.json << 'EOF'
{
  "name": "my-first-agent",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node agent.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "ws": "^8.14.0",
    "uuid": "^9.0.0"
  }
}
EOF
```

## 🎬 Step 4: Run Your Agent and See Magic! (1 minute)

```bash
# Run your agent
npm start
```

**Expected output:**
```
🔗 Connected to DiagramAI!
📊 Created diagram: My First Agent Diagram
🔵 Added node: Hello from Agent!
🔗 Connected nodes with animated edge
✅ Success! Check DiagramAI at http://localhost:3000
```

## 🎉 Step 5: Watch Real-time Collaboration

1. **Open DiagramAI**: Go to http://localhost:3000
2. **See Your Diagram**: You should see the diagram your agent just created!
3. **Try Editing**: Click on a node and edit it
4. **Run Agent Again**: Execute `npm start` again while editing
5. **Watch Magic**: See real-time collaboration between you and your agent! 🪄

## 🎯 What Just Happened?

Your MCP agent:
- ✅ Connected to DiagramAI via MCP protocol
- ✅ Created a new diagram
- ✅ Added two nodes with custom styling
- ✅ Connected them with an animated edge
- ✅ All changes appeared instantly in the web interface!

## 🚀 Next Steps

### 🔧 Customize Your Agent
```javascript
// Try different node types
node_data: {
  type: 'database',  // or 'cloud', 'process', 'input'
  position: { x: 300, y: 200 },
  data: {
    label: 'My Database',
    color: '#8b5cf6',
    icon: '🗄️'
  }
}

// Try different edge styles
edge_data: {
  type: 'step',      // or 'straight', 'smoothstep'
  animated: false,
  style: {
    stroke: '#ef4444',
    strokeWidth: 3
  }
}
```

### 📚 Learn More
- **[Complete Setup Guide](./MCP_AGENT_SETUP_GUIDE.md)**: Detailed agent development
- **[API Reference](./API_REFERENCE.md)**: All available MCP tools
- **[Examples](./MCP_AGENT_SETUP_GUIDE.md#example-building-a-system-architecture)**: Build complex diagrams

### 🛠️ Build Something Cool
Try creating:
- **System Architecture Diagrams**: Model your application stack
- **Process Flows**: Visualize business processes
- **Data Pipelines**: Map data transformations
- **Knowledge Graphs**: Connect concepts and ideas

## 🐛 Troubleshooting

### Agent Won't Connect?
```bash
# Check if services are running
docker-compose ps

# Check MCP server health
curl http://localhost:3001/health

# Check logs
docker-compose logs mcp-server
```

### No Diagram Appearing?
1. Refresh the DiagramAI page (http://localhost:3000)
2. Check browser console for errors
3. Verify agent completed successfully

### Need Help?
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)**: Common issues
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Advanced setup

## 🎊 Congratulations!

You've successfully:
- ✅ Deployed DiagramAI with MCP support
- ✅ Created your first MCP agent
- ✅ Experienced real-time agent-human collaboration
- ✅ Built your first automated diagram

**Welcome to the future of collaborative diagramming!** 🚀

---

**Ready for more?** Check out the [Complete MCP Guide](./MCP_README.md) to unlock the full power of DiagramAI MCP integration!
