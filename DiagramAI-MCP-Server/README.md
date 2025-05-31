# DiagramAI MCP Server

Streamlined Model Context Protocol server for DiagramAI agent integration.

## 🎯 Purpose

This is a focused MCP server that provides 8 essential tools for AI agents to interact with DiagramAI:

- **Diagram Management**: Create, read, list, delete diagrams
- **Node Operations**: Add and update diagram nodes
- **Edge Operations**: Add and update diagram connections
- **Real-time Sync**: WebSocket integration for live collaboration

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t diagramai-mcp-server .
docker run -p 3001:3001 diagramai-mcp-server
```

## 🔧 Configuration

The MCP server supports flexible configuration for different DiagramAI deployments:

```bash
# Environment variables
export DIAGRAMAI_HOST="your.diagramai.server"
export DIAGRAMAI_PORT="3000"
export DIAGRAMAI_PROTOCOL="http"
export DIAGRAMAI_WS_URL="ws://your.diagramai.server:3000/ws/diagrams"
export MCP_AGENT_ID="your-agent-id"

# Start server
npm start
```

**Or use command line arguments:**
```bash
node dist/index.js --host=your.server --port=3000 --protocol=https
```

**Standalone version:**
```bash
cd DiagramAI-MCP-Server
node standalone-server.js --host=10.202.28.111 --port=3000
```

### Legacy Environment Variables
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/diagramai"
DIAGRAMAI_API_KEY="your-api-key"
```

See [README-STANDALONE.md](./README-STANDALONE.md) for complete configuration options.

## 📚 Documentation

For complete setup and usage instructions, see the main documentation:

- **[Quick Start Guide](../DiagramAI/docs/QUICK_START.md)**
- **[Agent Setup Guide](../DiagramAI/docs/MCP_AGENT_SETUP_GUIDE.md)**
- **[API Reference](../DiagramAI/docs/API_REFERENCE.md)**
- **[Deployment Guide](../DiagramAI/docs/DEPLOYMENT_GUIDE.md)**

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `create_diagram` | Create new diagram |
| `read_diagram` | Get diagram data |
| `list_diagrams` | List all diagrams |
| `delete_diagram` | Delete diagram |
| `add_node` | Add node to diagram |
| `update_node` | Update existing node |
| `add_edge` | Connect two nodes |
| `update_edge` | Update existing edge |

## 🏗️ Architecture

```
MCP Agent → MCP Server → WebSocket → DiagramAI Frontend
                ↓
            PostgreSQL Database
```

## 📝 Notes

- This is a **streamlined** version focused on core MCP functionality
- Testing and linting are handled in the main DiagramAI application
- Shared utilities are imported from the main application
- Designed for single-user deployment scenarios

---

**Part of the DiagramAI project** - See main documentation for complete setup instructions.
