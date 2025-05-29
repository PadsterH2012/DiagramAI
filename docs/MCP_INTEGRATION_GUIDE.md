# MCP (Model Context Protocol) Integration Guide

## Overview

This guide covers the integration of the official Model Context Protocol (MCP) SDK v1.12.0 into the DiagramAI backend. MCP provides a standardized way to connect LLMs with external data sources and tools.

## Installation

The MCP SDK has been added to the backend dependencies:

```bash
npm install @modelcontextprotocol/sdk@^1.12.0
```

## MCP Server Architecture

### Core Components

1. **MCP Server**: Main server instance that handles tool registration and execution
2. **Transport Layer**: Communication protocol (Stdio, HTTP, WebSocket)
3. **Tools**: Individual functions that the AI can call
4. **Resources**: Data sources that the AI can access

### Server Setup

```javascript
// backend/src/mcp/server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'diagramai-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

export default server;
```

## DiagramAI MCP Tools

Based on the project design, implement these core MCP tools:

### 1. Diagram Generation Tool

```javascript
// backend/src/mcp/tools/generateDiagram.js
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_diagram',
        description: 'Creates flow or Mermaid diagram from natural language description',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Natural language description of the diagram'
            },
            format: {
              type: 'string',
              enum: ['flow', 'mermaid'],
              description: 'Output format: flow or mermaid'
            },
            diagram_type: {
              type: 'string',
              enum: ['flowchart', 'sequence', 'architecture', 'mindmap'],
              description: 'Type of diagram to generate'
            }
          },
          required: ['description', 'format']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'generate_diagram') {
    const { description, format, diagram_type } = request.params.arguments;
    
    // Implementation logic here
    const result = await generateDiagramFromDescription(description, format, diagram_type);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result)
        }
      ]
    };
  }
});
```

### 2. Diagram Analysis Tool

```javascript
// backend/src/mcp/tools/analyzeDiagram.js
{
  name: 'analyze_diagram',
  description: 'Provides logic analysis for diagrams in any format',
  inputSchema: {
    type: 'object',
    properties: {
      diagram_data: {
        type: 'object',
        description: 'Diagram data (flow nodes/edges or mermaid code)'
      },
      format: {
        type: 'string',
        enum: ['flow', 'mermaid'],
        description: 'Format of the input diagram'
      }
    },
    required: ['diagram_data', 'format']
  }
}
```

### 3. Conversion Tools

```javascript
// backend/src/mcp/tools/convertDiagram.js
{
  name: 'convert_flow_to_mermaid',
  description: 'Transforms visual flow diagram to Mermaid syntax',
  inputSchema: {
    type: 'object',
    properties: {
      flow_data: {
        type: 'object',
        description: 'Flow diagram data with nodes and edges'
      },
      target_type: {
        type: 'string',
        enum: ['flowchart', 'sequence', 'graph'],
        description: 'Target Mermaid diagram type'
      }
    },
    required: ['flow_data']
  }
},
{
  name: 'convert_mermaid_to_flow',
  description: 'Transforms Mermaid syntax to visual flow format',
  inputSchema: {
    type: 'object',
    properties: {
      mermaid_code: {
        type: 'string',
        description: 'Mermaid diagram code'
      },
      layout_hints: {
        type: 'object',
        description: 'Optional layout preferences'
      }
    },
    required: ['mermaid_code']
  }
}
```

## Integration with Express Server

### MCP Middleware

```javascript
// backend/src/middleware/mcpMiddleware.js
import mcpServer from '../mcp/server.js';

export const initializeMCP = async () => {
  try {
    // Initialize MCP server
    await mcpServer.connect();
    console.log('✅ MCP Server initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize MCP Server:', error);
    throw error;
  }
};

export const mcpToolHandler = async (toolName, args) => {
  try {
    const response = await mcpServer.request({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });
    return response.content;
  } catch (error) {
    console.error(`MCP Tool Error (${toolName}):`, error);
    throw error;
  }
};
```

### API Routes Integration

```javascript
// backend/src/routes/diagrams.js
import { mcpToolHandler } from '../middleware/mcpMiddleware.js';

// Generate diagram endpoint
app.post('/api/diagrams/generate', async (req, res) => {
  try {
    const { description, format, diagram_type } = req.body;
    
    const result = await mcpToolHandler('generate_diagram', {
      description,
      format,
      diagram_type
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze diagram endpoint
app.post('/api/diagrams/analyze', async (req, res) => {
  try {
    const { diagram_data, format } = req.body;
    
    const result = await mcpToolHandler('analyze_diagram', {
      diagram_data,
      format
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Environment Configuration

Add MCP-specific environment variables:

```bash
# .env
# MCP Configuration
MCP_SERVER_NAME=diagramai-mcp-server
MCP_SERVER_VERSION=1.0.0
MCP_TRANSPORT=stdio
MCP_LOG_LEVEL=info

# AI Provider Configuration (for MCP tools)
CLAUDE_API_KEY=your-claude-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## Testing MCP Integration

### Unit Tests

```javascript
// backend/tests/mcp.test.js
import { describe, it, expect } from '@jest/globals';
import mcpServer from '../src/mcp/server.js';

describe('MCP Server', () => {
  it('should initialize successfully', async () => {
    expect(mcpServer).toBeDefined();
  });

  it('should register diagram generation tool', async () => {
    const tools = await mcpServer.listTools();
    expect(tools.tools).toContainEqual(
      expect.objectContaining({
        name: 'generate_diagram'
      })
    );
  });
});
```

### Integration Tests

```javascript
// backend/tests/integration/mcp-tools.test.js
describe('MCP Tools Integration', () => {
  it('should generate flow diagram from description', async () => {
    const result = await mcpToolHandler('generate_diagram', {
      description: 'User login process',
      format: 'flow',
      diagram_type: 'flowchart'
    });
    
    expect(result).toHaveProperty('nodes');
    expect(result).toHaveProperty('edges');
  });
});
```

## Migration from Custom Implementation

If you have existing custom MCP implementation:

1. **Backup Current Implementation**
   ```bash
   git checkout -b backup-custom-mcp
   git add .
   git commit -m "Backup custom MCP implementation"
   git checkout main
   ```

2. **Replace Custom Code**
   - Remove custom MCP server files
   - Update import statements
   - Migrate tool definitions to new format

3. **Update Configuration**
   - Update environment variables
   - Modify startup scripts
   - Update Docker configuration if needed

## Deployment Considerations

### Docker Updates

```dockerfile
# backend/Dockerfile
# Add MCP SDK installation
RUN npm install @modelcontextprotocol/sdk@^1.12.0

# Ensure Node.js 20+ for MCP compatibility
FROM node:20-alpine
```

### Production Configuration

```javascript
// backend/src/config/production.js
export const mcpConfig = {
  server: {
    name: process.env.MCP_SERVER_NAME || 'diagramai-mcp-server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0'
  },
  transport: process.env.MCP_TRANSPORT || 'stdio',
  logLevel: process.env.MCP_LOG_LEVEL || 'warn'
};
```

## Next Steps

1. **Implement Core Tools**: Start with `generate_diagram` and `analyze_diagram`
2. **Add Conversion Tools**: Implement bidirectional conversion
3. **Testing**: Comprehensive unit and integration tests
4. **Documentation**: Update API documentation
5. **Monitoring**: Add logging and error tracking

## Resources

- [MCP TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-03-26)
- [MCP Examples](https://github.com/modelcontextprotocol/servers)

---

**Last Updated**: December 2024  
**MCP SDK Version**: 1.12.0  
**Protocol Version**: 2025-03-26
