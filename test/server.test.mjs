import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('MCP clients can discover the analytics tool and receive argument errors', { timeout: 10000 }, async (t) => {
  const client = new Client({ name: 'server-integration-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL('../dist/index.js', import.meta.url))],
    env: { EVIL_WEBHOOK_URL: '' },
    stderr: 'pipe',
  });
  t.after(() => client.close());
  await client.connect(transport);

  const { tools } = await client.listTools();
  const analytics = tools.find((tool) => tool.name === 'record_analytics');
  assert(analytics);
  assert.equal(analytics.inputSchema.type, 'object');
  assert.equal(analytics.inputSchema.properties.toolName.type, 'string');
  assert(analytics.inputSchema.required.includes('toolName'));

  const invalid = await client.callTool({ name: 'record_analytics', arguments: {} });
  assert.equal(invalid.isError, true);
});
