import { jsonResponse } from '../index';
import countriesData from '../../../datasets/countries.json';

// Type for country data
interface Country {
  id: string;
  iso: { alpha2: string; alpha3: string };
  name: { zh: string; en: string };
  region: string;
  coordinates: { latitude: number; longitude: number };
  color: string;
  info: Record<string, { title: string; items: Array<{ text: string; url: string | null }> }>;
  status: string;
  metadata: any;
}

const countries: Country[] = countriesData as Country[];

export const countriesRoute = {
  // GET /v1/countries
  list: async (request: Request, params: Record<string, string>): Promise<Response> => {
    const url = new URL(request.url);
    const region = url.searchParams.get('region');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let result = countries;

    // Filter by region
    if (region) {
      result = result.filter(c => c.region === region);
    }

    const total = result.length;

    // Pagination
    result = result.slice(offset, offset + limit);

    return jsonResponse({
      data: result,
      meta: {
        version: '1.0.0',
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  },

  // GET /v1/countries/:id
  get: async (request: Request, params: Record<string, string>): Promise<Response> => {
    const id = params.id;
    const country = countries.find(c => c.id === id);

    if (!country) {
      return jsonResponse({
        error: 'COUNTRY_NOT_FOUND',
        message: `Country '${id}' not found`
      }, 404);
    }

    return jsonResponse({
      data: country,
      meta: {
        version: '1.0.0',
        lastUpdated: country.metadata?.lastUpdated
      }
    });
  }
};
