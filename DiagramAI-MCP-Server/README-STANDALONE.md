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
            "args": ["/path/to/DiagramAI-MCP-Server/standalone-server.js"]
        }
    ]
}
```

Replace `/path/to/DiagramAI-MCP-Server/` with the actual path to this directory.

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

The standalone server currently returns mock responses for demonstration. To connect to a live DiagramAI instance, you would need to:

1. Ensure DiagramAI is running on `http://localhost:3000`
2. Update the `executeTool` method to make actual API calls to DiagramAI
3. Configure authentication if required

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
