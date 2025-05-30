#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Simple DiagramAI MCP Server
 */
class SimpleDiagramAIMCPServer extends Server {
  constructor() {
    super(
      {
        name: 'diagramai',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_diagram',
            description: 'Create a new diagram',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Diagram title' },
                format: { type: 'string', enum: ['reactflow', 'mermaid'] }
              },
              required: ['title', 'format']
            }
          },
          {
            name: 'list_diagrams',
            description: 'List all diagrams',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'number', default: 10 }
              }
            }
          }
        ]
      };
    });

    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const result = await this.executeTool(name, args || {});
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({ 
              success: false, 
              error: error.message 
            }, null, 2) 
          }],
          isError: true,
        };
      }
    });
  }

  async executeTool(toolName, args) {
    switch (toolName) {
      case 'create_diagram':
        return {
          success: true,
          diagram_uuid: `diagram_${Date.now()}`,
          title: args.title,
          format: args.format,
          message: 'Diagram created successfully'
        };

      case 'list_diagrams':
        return {
          success: true,
          diagrams: [
            { uuid: 'diagram_1', title: 'Sample Flowchart', format: 'reactflow' },
            { uuid: 'diagram_2', title: 'System Architecture', format: 'mermaid' }
          ],
          total: 2
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

async function main() {
  try {
    const server = new SimpleDiagramAIMCPServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    process.exit(1);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main().catch(() => process.exit(1));
}
