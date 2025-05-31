import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DiagramWebSocketClient } from '../websocket/client.js';
import { AuthService } from '../auth/authService.js';
import type { MCPServerConfig } from '../mcpServer.js';
import { z } from 'zod';

// Zod schemas for tool validation
const CreateDiagramSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  format: z.enum(['reactflow', 'mermaid']).default('reactflow'),
  content: z.any().optional(),
});

const GetDiagramSchema = z.object({
  diagramId: z.string().uuid(),
});

const UpdateDiagramSchema = z.object({
  diagramId: z.string().uuid(),
  title: z.string().optional(),
  content: z.any().optional(),
});

const DeleteDiagramSchema = z.object({
  diagramId: z.string().uuid(),
});

const ListDiagramsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  projectId: z.string().uuid().optional(),
});

const AddNodeSchema = z.object({
  diagramId: z.string().uuid(),
  node: z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: z.object({
      label: z.string(),
    }).passthrough(),
  }),
});

const AddEdgeSchema = z.object({
  diagramId: z.string().uuid(),
  edge: z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
  }),
});

export class DiagramTools {
  private wsClient: DiagramWebSocketClient;
  private authService: AuthService;
  private config: MCPServerConfig;
  private tools: Tool[] = [];

  constructor(wsClient: DiagramWebSocketClient, authService: AuthService, config: MCPServerConfig) {
    this.wsClient = wsClient;
    this.authService = authService;
    this.config = config;
    this.initializeTools();
  }

  async initialize(): Promise<void> {
    if (this.config.debug) {
      console.error('🔧 Initializing diagram tools...');
      console.error(`✅ ${this.tools.length} diagram tools ready`);
    }
  }

  private initializeTools(): void {
    this.tools = [
      {
        name: 'create_diagram',
        description: 'Create a new diagram with specified title and content',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title of the diagram' },
            description: { type: 'string', description: 'Optional description' },
            format: { type: 'string', enum: ['reactflow', 'mermaid'], description: 'Diagram format' },
            content: { type: 'object', description: 'Initial diagram content' },
          },
          required: ['title'],
        },
      },
      {
        name: 'get_diagram',
        description: 'Get diagram content by ID',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', format: 'uuid', description: 'UUID of the diagram' },
          },
          required: ['diagramId'],
        },
      },
      {
        name: 'update_diagram',
        description: 'Update diagram title or content',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', format: 'uuid', description: 'UUID of the diagram' },
            title: { type: 'string', description: 'New title' },
            content: { type: 'object', description: 'New diagram content' },
          },
          required: ['diagramId'],
        },
      },
      {
        name: 'delete_diagram',
        description: 'Delete a diagram',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', format: 'uuid', description: 'UUID of the diagram' },
          },
          required: ['diagramId'],
        },
      },
      {
        name: 'list_diagrams',
        description: 'List available diagrams',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', minimum: 1, maximum: 100, description: 'Number of diagrams to return' },
            projectId: { type: 'string', format: 'uuid', description: 'Filter by project ID' },
          },
        },
      },
      {
        name: 'add_node',
        description: 'Add a node to a diagram',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', format: 'uuid', description: 'UUID of the diagram' },
            node: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Node ID' },
                type: { type: 'string', description: 'Node type' },
                position: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                  },
                  required: ['x', 'y'],
                },
                data: {
                  type: 'object',
                  properties: {
                    label: { type: 'string' },
                  },
                  required: ['label'],
                },
              },
              required: ['id', 'type', 'position', 'data'],
            },
          },
          required: ['diagramId', 'node'],
        },
      },
      {
        name: 'add_edge',
        description: 'Add an edge between nodes',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', format: 'uuid', description: 'UUID of the diagram' },
            edge: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Edge ID' },
                source: { type: 'string', description: 'Source node ID' },
                target: { type: 'string', description: 'Target node ID' },
                label: { type: 'string', description: 'Optional edge label' },
              },
              required: ['id', 'source', 'target'],
            },
          },
          required: ['diagramId', 'edge'],
        },
      },
    ];
  }

  async getAvailableTools(): Promise<Tool[]> {
    return this.tools;
  }

  getToolCount(): number {
    return this.tools.length;
  }

  async executeTool(name: string, args: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (name) {
        case 'create_diagram':
          result = await this.createDiagram(CreateDiagramSchema.parse(args));
          break;
        case 'get_diagram':
          result = await this.getDiagram(GetDiagramSchema.parse(args));
          break;
        case 'update_diagram':
          result = await this.updateDiagram(UpdateDiagramSchema.parse(args));
          break;
        case 'delete_diagram':
          result = await this.deleteDiagram(DeleteDiagramSchema.parse(args));
          break;
        case 'list_diagrams':
          result = await this.listDiagrams(ListDiagramsSchema.parse(args));
          break;
        case 'add_node':
          result = await this.addNode(AddNodeSchema.parse(args));
          break;
        case 'add_edge':
          result = await this.addEdge(AddEdgeSchema.parse(args));
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      const duration = Date.now() - startTime;
      
      if (this.config.debug) {
        console.error(`✅ Tool executed: ${name} (${duration}ms)`);
      }

      return {
        success: true,
        result,
        tool: name,
        duration,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (this.config.debug) {
        console.error(`❌ Tool failed: ${name} (${duration}ms)`, error);
      }

      throw error;
    }
  }

  private async createDiagram(args: z.infer<typeof CreateDiagramSchema>): Promise<any> {
    const response = await this.authService.makeAuthenticatedRequest('/api/diagrams', {
      method: 'POST',
      body: JSON.stringify(args),
    });

    return response.json();
  }

  private async getDiagram(args: z.infer<typeof GetDiagramSchema>): Promise<any> {
    const response = await this.authService.makeAuthenticatedRequest(`/api/diagrams/${args.diagramId}`);
    return response.json();
  }

  private async updateDiagram(args: z.infer<typeof UpdateDiagramSchema>): Promise<any> {
    const { diagramId, ...updates } = args;
    const response = await this.authService.makeAuthenticatedRequest(`/api/diagrams/${diagramId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    return response.json();
  }

  private async deleteDiagram(args: z.infer<typeof DeleteDiagramSchema>): Promise<any> {
    const response = await this.authService.makeAuthenticatedRequest(`/api/diagrams/${args.diagramId}`, {
      method: 'DELETE',
    });

    return response.json();
  }

  private async listDiagrams(args: z.infer<typeof ListDiagramsSchema>): Promise<any> {
    const params = new URLSearchParams();
    if (args.limit) params.append('limit', args.limit.toString());
    if (args.projectId) params.append('projectId', args.projectId);

    const response = await this.authService.makeAuthenticatedRequest(`/api/diagrams?${params}`);
    return response.json();
  }

  private async addNode(args: z.infer<typeof AddNodeSchema>): Promise<any> {
    const response = await this.authService.makeAuthenticatedRequest(`/api/diagrams/${args.diagramId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(args.node),
    });

    return response.json();
  }

  private async addEdge(args: z.infer<typeof AddEdgeSchema>): Promise<any> {
    const response = await this.authService.makeAuthenticatedRequest(`/api/diagrams/${args.diagramId}/edges`, {
      method: 'POST',
      body: JSON.stringify(args.edge),
    });

    return response.json();
  }
}
