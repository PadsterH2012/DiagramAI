import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DiagramWebSocketClient } from './websocket/client.js';
import { DiagramTools } from './tools/diagramTools.js';
import { AuthService } from './auth/authService.js';

export class DiagramAIMCPServer extends Server {
  private wsClient: DiagramWebSocketClient;
  private diagramTools: DiagramTools;
  private authService: AuthService;
  private isInitialized = false;

  constructor() {
    super(
      {
        name: 'diagramai-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize services
    this.wsClient = new DiagramWebSocketClient();
    this.authService = new AuthService();
    this.diagramTools = new DiagramTools(this.wsClient, this.authService);

    this.setupHandlers();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.error('🔧 Initializing DiagramAI MCP Server...');

    try {
      // Initialize authentication service
      await this.authService.initialize();
      console.error('✅ Authentication service initialized');

      // Initialize WebSocket connection to DiagramAI
      await this.wsClient.connect();
      console.error('✅ WebSocket connection established');

      // Initialize diagram tools
      await this.diagramTools.initialize();
      console.error('✅ Diagram tools initialized');

      this.isInitialized = true;
      console.error('🎉 DiagramAI MCP Server initialization complete');

    } catch (error) {
      console.error('❌ Failed to initialize MCP Server:', error);
      throw error;
    }
  }

  private setupHandlers(): void {
    // Handle tool listing
    this.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = await this.diagramTools.getAvailableTools();
      return { tools };
    });

    // Handle tool execution
    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        console.error(`🔧 Executing tool: ${name}`);
        const result = await this.diagramTools.executeTool(name, args || {});
        
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

  async close(): Promise<void> {
    console.error('🛑 Closing DiagramAI MCP Server...');
    
    try {
      if (this.wsClient) {
        await this.wsClient.disconnect();
        console.error('✅ WebSocket connection closed');
      }

      if (this.authService) {
        await this.authService.close();
        console.error('✅ Authentication service closed');
      }

      console.error('✅ DiagramAI MCP Server closed successfully');
    } catch (error) {
      console.error('❌ Error during server shutdown:', error);
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      return (
        this.isInitialized &&
        this.wsClient.isConnected() &&
        this.authService.isReady()
      );
    } catch {
      return false;
    }
  }

  // Get server statistics
  getStats(): any {
    return {
      initialized: this.isInitialized,
      websocketConnected: this.wsClient.isConnected(),
      authServiceReady: this.authService.isReady(),
      availableTools: this.diagramTools.getToolCount(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
