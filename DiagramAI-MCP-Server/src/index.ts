#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DiagramAIMCPServer } from './mcpServer.js';

/**
 * Main entry point for the DiagramAI MCP Server
 */
async function main() {
  console.error('🚀 Starting DiagramAI MCP Server...');

  try {
    // Create the MCP server instance
    const server = new DiagramAIMCPServer();

    // Initialize the server
    await server.initialize();

    // Create transport and start the server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('✅ DiagramAI MCP Server is running');
    console.error('📡 Listening for MCP requests via stdio');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('🛑 Shutting down DiagramAI MCP Server...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('🛑 Shutting down DiagramAI MCP Server...');
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start DiagramAI MCP Server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
