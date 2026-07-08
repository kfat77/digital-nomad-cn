#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  loadCountries,
  getCountryById,
  searchCountries,
  getRegions,
  getRegionStats,
  recommendCountries,
} from './data-loader.js';

const TOOLS: Tool[] = [
  {
    name: 'nomad_search_countries',
    description: `Search countries in the Digital Nomad CN dataset by keyword, region, or status.

Use this when the user asks about:
- "Show me countries in Southeast Asia"
- "List all active countries"
- "Find Thailand"
- Any query that involves finding or listing countries

Returns an array of country summaries with id, name (zh/en), region, status, and coordinates.`,
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search keyword — matches country id, Chinese name, English name, or ISO code',
        },
        region: {
          type: 'string',
          description: 'Filter by geographic region, e.g. "southeast-asia", "western-europe", "east-asia"',
        },
        status: {
          type: 'string',
          enum: ['active', 'draft', 'deprecated'],
          description: 'Filter by data status',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'nomad_get_country',
    description: `Get detailed information about a specific country by its ID.

Use this when the user asks about:
- "Tell me about Thailand"
- "What is the visa situation in Japan?"
- "Show details for Portugal"
- Any query about a single specific country

Returns full country record including name, region, coordinates, status, metadata, and info.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Country ID, e.g. "thailand", "japan", "portugal"',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'nomad_list_regions',
    description: `List all geographic regions available in the dataset, with country counts.

Use this when the user asks about:
- "What regions do you cover?"
- "How many countries in Europe?"
- "List all regions"
- Any overview question about geographic coverage`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'nomad_compare_countries',
    description: `Compare multiple countries side by side.

Use this when the user asks about:
- "Compare Thailand and Malaysia"
- "Thailand vs Vietnam vs Indonesia"
- "Which is better, Portugal or Spain?"
- Any comparative question about countries

Returns a side-by-side comparison of name, region, status, and data quality.`,
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of country IDs to compare, e.g. ["thailand", "malaysia"]',
        },
      },
      required: ['ids'],
    },
  },
  {
    name: 'nomad_recommend',
    description: `Get personalized country recommendations based on preferences.

Use this when the user asks about:
- "Recommend a country for digital nomads"
- "Where should I go in Southeast Asia?"
- "Best countries for remote work in Europe"
- "I want warm weather and low cost of living"
- Any request for suggestions or recommendations

Returns a ranked list of countries matching the preferences. Active countries with higher data quality are prioritized.`,
    inputSchema: {
      type: 'object',
      properties: {
        regions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Preferred regions, e.g. ["southeast-asia", "east-asia"]',
        },
        avoidRegions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Regions to exclude, e.g. ["africa", "middle-east"]',
        },
        status: {
          type: 'string',
          enum: ['active', 'draft'],
          description: 'Preferred status filter (default: active)',
          default: 'active',
        },
        limit: {
          type: 'number',
          description: 'Maximum recommendations (default 5)',
          default: 5,
        },
      },
    },
  },
  {
    name: 'nomad_get_stats',
    description: `Get dataset statistics and overview.

Use this when the user asks about:
- "How many countries do you have?"
- "What is the data coverage?"
- "Show me dataset stats"
- Any question about the dataset itself

Returns total country count, region distribution, status breakdown, and average data quality scores.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

const server = new Server(
  {
    name: 'digital-nomad-cn-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'nomad_search_countries': {
        const { keyword, region, status, limit = 20 } = args as any;
        const results = searchCountries({ keyword, region, status });
        const limited = results.slice(0, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  count: results.length,
                  returned: limited.length,
                  countries: limited.map((c) => ({
                    id: c.id,
                    name: c.name,
                    region: c.region,
                    status: c.status,
                    coordinates: c.coordinates,
                    dataQuality: c.metadata?.dataQuality,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'nomad_get_country': {
        const { id } = args as { id: string };
        const country = getCountryById(id);
        if (!country) {
          return {
            content: [
              { type: 'text', text: JSON.stringify({ error: `Country "${id}" not found` }, null, 2) },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(country, null, 2),
            },
          ],
        };
      }

      case 'nomad_list_regions': {
        const stats = getRegionStats();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  totalRegions: stats.length,
                  totalCountries: stats.reduce((sum, s) => sum + s.count, 0),
                  regions: stats,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'nomad_compare_countries': {
        const { ids } = args as { ids: string[] };
        const countries = ids.map((id) => getCountryById(id)).filter(Boolean);
        const notFound = ids.filter((id) => !getCountryById(id));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  requested: ids,
                  found: countries.length,
                  notFound: notFound.length > 0 ? notFound : undefined,
                  comparison: countries.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    region: c.region,
                    status: c.status,
                    iso: c.iso,
                    coordinates: c.coordinates,
                    dataQuality: c.metadata?.dataQuality,
                    infoSummary: Object.keys(c.info || {}).length > 0
                      ? `Has ${Object.keys(c.info).length} info categories`
                      : 'No detailed info yet',
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'nomad_recommend': {
        const { regions, avoidRegions, status = 'active', limit = 5 } = args as any;
        const recommendations = recommendCountries({ regions, avoidRegions, status });
        const limited = recommendations.slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  preferences: { regions, avoidRegions, status },
                  totalMatches: recommendations.length,
                  returned: limited.length,
                  recommendations: limited.map((c, i) => ({
                    rank: i + 1,
                    id: c.id,
                    name: c.name,
                    region: c.region,
                    status: c.status,
                    dataQuality: c.metadata?.dataQuality,
                    reason: `${c.name.zh}（${c.name.en}）位于${c.region}，数据状态为 ${c.status}`,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'nomad_get_stats': {
        const countries = loadCountries();
        const activeCount = countries.filter((c) => c.status === 'active').length;
        const draftCount = countries.filter((c) => c.status === 'draft').length;
        const avgCompleteness =
          countries.reduce((sum, c) => sum + (c.metadata?.dataQuality?.completeness || 0), 0) /
          countries.length;
        const avgAccuracy =
          countries.reduce((sum, c) => sum + (c.metadata?.dataQuality?.accuracy || 0), 0) /
          countries.length;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  dataset: 'Digital Nomad CN',
                  version: '2.0.0',
                  totalCountries: countries.length,
                  statusBreakdown: { active: activeCount, draft: draftCount },
                  regionCoverage: getRegions(),
                  averageDataQuality: {
                    completeness: Math.round(avgCompleteness),
                    accuracy: Math.round(avgAccuracy),
                  },
                  note: 'Data quality is continuously improving through community contributions.',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  // Pre-load data
  try {
    loadCountries();
    console.error('Digital Nomad CN MCP Server started');
    console.error(`Loaded ${loadCountries().length} countries`);
  } catch (error: any) {
    console.error(`Warning: Could not load dataset: ${error.message}`);
    console.error('Some tools may not work correctly.');
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
