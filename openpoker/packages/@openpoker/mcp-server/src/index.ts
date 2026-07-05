/**
 * @openpoker/mcp-server — MCP Server for OpenPoker
 *
 * Exposes poker analysis tools to AI Agents via the Model Context Protocol.
 *
 * ```json
 * {
 *   "mcpServers": {
 *     "poker": {
 *       "command": "npx",
 *       "args": ["-y", "@openpoker/mcp-server"]
 *     }
 *   }
 * }
 * ```
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// TODO: Implement MCP Server with tools:
// - poker_calculate_equity
// - poker_analyze_range
// - poker_get_strategy
// - poker_review_hand
// - poker_query_database

console.log('[openpoker/mcp] Server starting...');
