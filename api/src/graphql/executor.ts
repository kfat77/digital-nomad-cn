import { jsonResponse } from '../index';
import { typeDefs, resolvers } from './schema';

/**
 * Simple GraphQL execution without external dependencies
 * Parses basic GraphQL queries and executes against our resolvers
 */

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

export async function handleGraphQL(request: Request): Promise<Response> {
  try {
    const body: GraphQLRequest = await request.json();
    const result = executeGraphQL(body.query, body.variables);
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({
      errors: [{ message: error instanceof Error ? error.message : 'Invalid request' }]
    }, 400);
  }
}

function executeGraphQL(query: string, variables: Record<string, any> = {}): any {
  // Simple query parser for our schema
  // This is a minimal implementation - production would use graphql-js
  
  const result: any = { data: {} };
  
  // Parse query (simplified)
  const queryMatch = query.match(/(\w+)(?:\(([^)]*)\))?\s*\{[\s\S]*?\}/);
  if (!queryMatch) {
    return { errors: [{ message: 'Invalid query format' }] };
  }
  
  const operation = queryMatch[1];
  const argsStr = queryMatch[2] || '';
  
  // Parse arguments
  const args: Record<string, any> = {};
  if (argsStr) {
    const argMatches = argsStr.matchAll(/(\w+):\s*([^,\s]+)/g);
    for (const match of argMatches) {
      let value: any = match[2];
      // Remove quotes if string
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (!isNaN(Number(value))) {
        value = Number(value);
      }
      
      // Check for variables
      if (typeof value === 'string' && value.startsWith('$')) {
        value = variables[value.slice(1)];
      }
      
      args[match[1]] = value;
    }
  }
  
  // Execute resolver
  const resolver = (resolvers.Query as any)[operation];
  if (!resolver) {
    return { errors: [{ message: `Unknown operation: ${operation}` }] };
  }
  
  result.data[operation] = resolver(null, args);
  
  return result;
}
