# DiagramAI MCP Server - Standalone Version

A standalone Model Context Protocol (MCP) server that provides DiagramAI functionality to MCP clients like Augment.

## 🚀 Quick Setup for Augment

### Option 1: Direct Node.js Command

Add this to your Augment configuration:

```json
"augment.advanced": {
    "mcpServers": [
        {
            "name": "diagramai",
            "command": "node",
            "args": ["/path/to/DiagramAI-MCP-Server/standalone-server.js"],
            "env": {
                "DIAGRAMAI_HOST": "10.202.28.111",
                "DIAGRAMAI_PORT": "3000",
                "DIAGRAMAI_PROTOCOL": "http"
            }
        }
    ]
}
```

Replace `/path/to/DiagramAI-MCP-Server/` with the actual path to this directory.

**Alternative with CLI arguments:**
```json
"augment.advanced": {
    "mcpServers": [
        {
            "name": "diagramai",
            "command": "node",
            "args": [
                "/path/to/DiagramAI-MCP-Server/standalone-server.js",
                "--host=10.202.28.111",
                "--port=3000",
                "--protocol=http"
            ]
        }
    ]
}
```

### Option 2: Install Globally (Recommended)

1. Run the installation script:
```bash
./install-standalone.sh
```

2. Add this to your Augment configuration:
```json
"augment.advanced": {
    "mcpServers": [
        {
            "name": "diagramai",
            "command": "diagramai-mcp"
        }
    ]
}
```

## 🛠️ Available Tools

The MCP server provides these tools for AI agents:

### `create_diagram`
Create a new diagram in DiagramAI
- **title** (required): Title of the diagram
- **description** (optional): Description of the diagram  
- **format** (required): Either "reactflow" or "mermaid"
- **content** (optional): Initial diagram content

### `list_diagrams`
List all diagrams in DiagramAI
- **limit** (optional): Maximum number of diagrams to return (default: 10)

### `get_diagram`
Get a specific diagram by UUID
- **diagram_uuid** (required): UUID of the diagram to retrieve

### `add_node`
Add a node to an existing diagram
- **diagram_uuid** (required): UUID of the diagram
- **node_data** (required): Node data including position, label, type, etc.

### `add_edge`
Add an edge/connection between nodes
- **diagram_uuid** (required): UUID of the diagram
- **edge_data** (required): Edge data including source, target, label, etc.

### `delete_diagram`
Delete a diagram from DiagramAI
- **diagram_uuid** (required): UUID of the diagram to delete

## 🧪 Testing

Test the server directly:
```bash
node standalone-server.js
```

The server will start and listen for MCP requests via stdio.

## 📋 Requirements

- Node.js 18+
- The DiagramAI application running (for full functionality)

## 🔧 Configuration

The standalone server supports multiple configuration methods to connect to your DiagramAI instance:

### Environment Variables (Recommended for deployment)
```bash
export DIAGRAMAI_HOST="192.168.1.100"
export DIAGRAMAI_PORT="3000"
export DIAGRAMAI_PROTOCOL="http"
export DIAGRAMAI_WS_URL="ws://192.168.1.100:3000/ws/diagrams"
export MCP_AGENT_ID="my-agent-id"

node standalone-server.js
```

### Command Line Arguments (Recommended for testing)
```bash
node standalone-server.js --host=192.168.1.100 --port=3000 --protocol=http
```

### Configuration Priority
1. **Command line arguments** (highest priority)
2. **Environment variables** 
3. **Default values** (lowest priority)

### Available Options

| Option | CLI Argument | Environment Variable | Default | Description |
|--------|-------------|---------------------|---------|-------------|
| Host | `--host=<ip>` | `DIAGRAMAI_HOST` | `localhost` | DiagramAI server hostname/IP |
| Port | `--port=<port>` | `DIAGRAMAI_PORT` | `3000` | DiagramAI server port |
| Protocol | `--protocol=<proto>` | `DIAGRAMAI_PROTOCOL` | `http` | HTTP protocol (http/https) |
| WebSocket URL | N/A | `DIAGRAMAI_WS_URL` | Auto-generated | Full WebSocket URL |
| Agent ID | N/A | `MCP_AGENT_ID` | Auto-generated | Unique agent identifier |

### Deployment Examples

#### Docker Deployment
```bash
docker run -e DIAGRAMAI_HOST=10.202.28.111 -e DIAGRAMAI_PORT=3000 \
  node standalone-server.js
```

#### Cloud Instance
```bash
export DIAGRAMAI_HOST="diagramai.example.com"
export DIAGRAMAI_PORT="443"
export DIAGRAMAI_PROTOCOL="https"
node standalone-server.js
```

#### Local Development
```bash
node standalone-server.js --host=localhost --port=3001
```

#### Multiple Environments
```bash
# Development
export DIAGRAMAI_HOST="dev.diagramai.local"
node standalone-server.js

# Production  
export DIAGRAMAI_HOST="prod.diagramai.com"
export DIAGRAMAI_PROTOCOL="https"
node standalone-server.js
```

**Note**: The standalone server currently returns mock responses for demonstration. To connect to a live DiagramAI instance, the mock responses in `executeTool` method would need to be replaced with actual API calls to the configured DiagramAI endpoint.

## 🐛 Troubleshooting

### "command not found" error
Make sure Node.js is installed and the path to the script is correct.

### Permission denied
Run `chmod +x standalone-server.js` to make the script executable.

### Connection issues
Ensure the DiagramAI application is running and accessible.

## 📝 Example Usage in Augment

Once configured, you can use commands like:

- "Create a new flowchart diagram called 'User Registration Process'"
- "List all my diagrams"
- "Add a decision node to diagram xyz"
- "Show me the contents of diagram abc"

The AI agent will automatically use the appropriate MCP tools to interact with DiagramAI.
