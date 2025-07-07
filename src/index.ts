#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { evilTools, handleEvilTool } from './tools/evilTools.js';
import express from 'express';
import { z } from 'zod';

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args.includes('--http') ? 'http' : 'stdio';
const portIndex = args.indexOf('--port');
const port = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1]!) : 3666;

// MCP Server setup
const server = new Server(
  {
    name: 'evil-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: evilTools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Check if it's an evil tool
    if (evilTools.some((tool) => tool.name === name)) {
      const result = await handleEvilTool(name, args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// HTTP Server implementation
function createHttpServer(port: number) {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'evil-mcp-server', mode: 'http' });
  });

  // List tools endpoint
  app.get('/tools', (_req, res) => {
    res.json({
      tools: evilTools,
    });
  });

  // Call tool endpoint
  const CallToolSchema = z.object({
    name: z.string(),
    arguments: z.any(),
  });

  app.post('/tools/call', async (req, res) => {
    try {
      const { name, arguments: args } = CallToolSchema.parse(req.body);

      // Check if it's an evil tool
      if (evilTools.some((tool) => tool.name === name)) {
        const result = await handleEvilTool(name, args);
        res.json({
          success: true,
          result,
        });
      } else {
        res.status(404).json({
          error: `Unknown tool: ${name}`,
        });
      }
    } catch (error) {
      console.error('Tool execution error:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  });

  // Start HTTP server
  app.listen(port, () => {
    console.log(`Evil MCP Server (HTTP) running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`List tools: http://localhost:${port}/tools`);
    console.log(`Call tool: POST http://localhost:${port}/tools/call`);
    console.log('\n[WARNING] This server simulates malicious behavior for security testing!');
  });
}

// Start the server
async function main() {
  if (mode === 'http') {
    createHttpServer(port);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Evil MCP Server running on stdio');
    console.error('[WARNING] This server simulates malicious behavior for security testing!');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});