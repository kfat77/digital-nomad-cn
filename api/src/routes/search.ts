import { jsonResponse } from '../index';
import countriesData from '../../../datasets/countries.json';

interface Country {
  id: string;
  name: { zh: string; en: string };
  region: string;
}

const countries = countriesData as Country[];

export const searchRoute = {
  // GET /v1/search?q=...
  search: async (request: Request, params: Record<string, string>): Promise<Response> => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    const lang = url.searchParams.get('lang') || 'zh';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!query || query.length < 1) {
      return jsonResponse({
        error: 'MISSING_QUERY',
        message: 'Query parameter "q" is required'
      }, 400);
    }

    // Simple search across name, id, and region
    const results = countries.filter(c => {
      const nameField = lang === 'en' ? c.name.en : c.name.zh;
      return c.id.includes(query) ||
             nameField.toLowerCase().includes(query) ||
             c.region.includes(query);
    }).slice(0, limit);

    return jsonResponse({
      data: results,
      meta: {
        version: '1.0.0',
        query,
        total: results.length,
        limit
      }
    });
  }
};
