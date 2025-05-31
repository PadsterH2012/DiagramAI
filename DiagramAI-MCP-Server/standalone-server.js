#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import WebSocket from 'ws';

/**
 * Parse command line arguments and environment variables to create configuration
 */
function parseConfiguration() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const config = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--host=')) {
      config.host = arg.split('=')[1];
    } else if (arg.startsWith('--port=')) {
      config.port = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--protocol=')) {
      config.protocol = arg.split('=')[1];
    } else if (arg.startsWith('--config=')) {
      // TODO: Support config file in future enhancement
      console.error('⚠️ Config file support not yet implemented');
    }
  }
  
  // Get configuration from environment variables with CLI args taking precedence
  const host = config.host || process.env.DIAGRAMAI_HOST || 'localhost';
  const port = config.port || parseInt(process.env.DIAGRAMAI_PORT, 10) || 3000;
  const protocol = config.protocol || process.env.DIAGRAMAI_PROTOCOL || 'http';
  const wsUrl = process.env.DIAGRAMAI_WS_URL || `ws://${host}:${port}/ws/diagrams`;
  const agentId = process.env.MCP_AGENT_ID || `mcp-agent-${Date.now()}`;
  
  return {
    host,
    port,
    protocol,
    wsUrl,
    agentId,
    baseUrl: `${protocol}://${host}:${port}`
  };
}

/**
 * Standalone DiagramAI MCP Server
 * This server can be used directly with MCP clients like Augment
 */
class StandaloneDiagramAIMCPServer extends Server {
  constructor(config = {}) {
    super(
      {
        name: 'diagramai-standalone',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = config;
    this.setupHandlers();
  }

  setupHandlers() {
    // Handle tool listing
    this.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_diagram',
            description: 'Create a new diagram in DiagramAI',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the diagram'
                },
                description: {
                  type: 'string',
                  description: 'Description of the diagram'
                },
                format: {
                  type: 'string',
                  enum: ['reactflow', 'mermaid'],
                  description: 'Format of the diagram'
                },
                content: {
                  type: 'object',
                  description: 'Initial diagram content'
                }
              },
              required: ['title', 'format']
            }
          },
          {
            name: 'list_diagrams',
            description: 'List all diagrams in DiagramAI',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of diagrams to return',
                  default: 10
                }
              }
            }
          },
          {
            name: 'get_diagram',
            description: 'Get a specific diagram by UUID',
            inputSchema: {
              type: 'object',
              properties: {
                diagram_uuid: {
                  type: 'string',
                  description: 'UUID of the diagram to retrieve'
                }
              },
              required: ['diagram_uuid']
            }
          },
          {
            name: 'add_node',
            description: 'Add a node to an existing diagram',
            inputSchema: {
              type: 'object',
              properties: {
                diagram_uuid: {
                  type: 'string',
                  description: 'UUID of the diagram'
                },
                node_data: {
                  type: 'object',
                  description: 'Node data including position, label, type, etc.'
                }
              },
              required: ['diagram_uuid', 'node_data']
            }
          },
          {
            name: 'add_edge',
            description: 'Add an edge/connection between nodes',
            inputSchema: {
              type: 'object',
              properties: {
                diagram_uuid: {
                  type: 'string',
                  description: 'UUID of the diagram'
                },
                edge_data: {
                  type: 'object',
                  description: 'Edge data including source, target, label, etc.'
                }
              },
              required: ['diagram_uuid', 'edge_data']
            }
          },
          {
            name: 'delete_diagram',
            description: 'Delete a diagram from DiagramAI',
            inputSchema: {
              type: 'object',
              properties: {
                diagram_uuid: {
                  type: 'string',
                  description: 'UUID of the diagram to delete'
                }
              },
              required: ['diagram_uuid']
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Log to stderr only (stdout is reserved for MCP JSON responses)
        console.error(`🔧 Executing tool: ${name}`);
        const result = await this.executeTool(name, args || {});

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`❌ Tool execution failed: ${name}`, error);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                tool: name,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async executeTool(toolName, args) {
    // For now, return mock responses. In a real implementation,
    // this would connect to the DiagramAI WebSocket API at the configured endpoint
    const { wsUrl, baseUrl, host, port } = this.config;
    
    switch (toolName) {
      case 'create_diagram':
        return {
          success: true,
          diagram_uuid: `diagram_${Date.now()}`,
          title: args.title,
          format: args.format,
          message: `Diagram created successfully (mock response from ${baseUrl})`,
          config: { host, port, wsUrl },
          timestamp: new Date().toISOString()
        };

      case 'list_diagrams':
        return {
          success: true,
          diagrams: [
            {
              uuid: 'diagram_1',
              title: 'Sample Flowchart',
              format: 'reactflow',
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              uuid: 'diagram_2', 
              title: 'System Architecture',
              format: 'mermaid',
              created_at: '2024-01-02T00:00:00Z'
            }
          ],
          total: 2,
          message: `Diagrams retrieved successfully (mock response from ${baseUrl})`,
          config: { host, port, wsUrl }
        };

      case 'get_diagram':
        return {
          success: true,
          diagram: {
            uuid: args.diagram_uuid,
            title: 'Sample Diagram',
            format: 'reactflow',
            content: {
              nodes: [
                { id: '1', position: { x: 100, y: 100 }, data: { label: 'Start' } }
              ],
              edges: []
            }
          },
          message: `Diagram retrieved successfully (mock response from ${baseUrl})`,
          config: { host, port, wsUrl }
        };

      case 'add_node':
        return {
          success: true,
          node_id: `node_${Date.now()}`,
          diagram_uuid: args.diagram_uuid,
          message: `Node added successfully (mock response from ${baseUrl})`,
          config: { host, port, wsUrl }
        };

      case 'add_edge':
        return {
          success: true,
          edge_id: `edge_${Date.now()}`,
          diagram_uuid: args.diagram_uuid,
          message: `Edge added successfully (mock response from ${baseUrl})`,
          config: { host, port, wsUrl }
        };

      case 'delete_diagram':
        return {
          success: true,
          diagram_uuid: args.diagram_uuid,
          message: `Diagram deleted successfully (mock response from ${baseUrl})`,
          config: { host, port, wsUrl }
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

/**
 * Main entry point for the standalone MCP server
 */
async function main() {
  // Parse configuration from environment variables and command line arguments
  const config = parseConfiguration();
  
  // Only log to stderr to keep stdout clean for MCP JSON
  console.error('🚀 Starting Standalone DiagramAI MCP Server...');
  console.error(`🔧 Configuration:`);
  console.error(`   Host: ${config.host}`);
  console.error(`   Port: ${config.port}`);
  console.error(`   Protocol: ${config.protocol}`);
  console.error(`   WebSocket URL: ${config.wsUrl}`);
  console.error(`   Agent ID: ${config.agentId}`);

  try {
    // Create the MCP server instance with configuration
    const server = new StandaloneDiagramAIMCPServer(config);

    // Create transport and start the server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('✅ Standalone DiagramAI MCP Server is running');
    console.error('📡 Listening for MCP requests via stdio');
    console.error(`🌐 Configured to connect to DiagramAI at ${config.baseUrl}`);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('🛑 Shutting down Standalone DiagramAI MCP Server...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('🛑 Shutting down Standalone DiagramAI MCP Server...');
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start Standalone DiagramAI MCP Server:', error);
    process.exit(1);
  }
}

// Start the server
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
