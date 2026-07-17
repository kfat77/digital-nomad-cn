/**
 * Digital Nomad CN SDK
 * TypeScript client for the Global Mobility Open Infrastructure API
 */

export interface Country {
  id: string;
  iso: { alpha2: string; alpha3: string };
  name: { zh: string; en: string };
  region: string;
  coordinates: { latitude: number; longitude: number };
  color: string;
  info: Record<string, { title: string; items: Array<{ text: string; url: string | null }> }>;
  status: string;
  metadata: CountryMetadata;
}

export interface CountryMetadata {
  version: string;
  lastUpdated: string;
  createdAt: string;
  contributors: Array<{ github?: string; name?: string; role?: string }>;
  sources: Array<{ name: string; url?: string; type?: string }>;
  dataQuality: { completeness: number; accuracy: number; freshness: number };
  extractionNote?: string;
  verification?: CountryVerification;
}

export interface CountryVerification {
  reviewedFields: Array<'visa_entry' | 'digital_nomad_visa' | 'banking' | 'securities'>;
  lastReviewedAt: string;
  sources: Array<{ field: string; name: string; url: string; sourceType: 'official' }>;
  note?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    version: string;
    total?: number;
    limit?: number;
    offset?: number;
    hasMore?: boolean;
    lastUpdated?: string;
    query?: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
}

export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

const DEFAULT_BASE_URL = 'https://api.digital-nomad.cn';

export class NomadClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || 30000;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'UNKNOWN_ERROR', message: response.statusText })) as ApiError;
        throw new NomadApiError(error.error, error.message, response.status);
      }

      return await response.json() as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof NomadApiError) throw error;
      throw new NomadApiError('NETWORK_ERROR', error instanceof Error ? error.message : 'Network error', 0);
    }
  }

  // Countries
  async listCountries(options: { region?: string; limit?: number; offset?: number } = {}): Promise<ApiResponse<Country[]>> {
    const params = new URLSearchParams();
    if (options.region) params.set('region', options.region);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset !== undefined) params.set('offset', String(options.offset));

    const query = params.toString();
    return this.request<Country[]>(`/v1/countries${query ? '?' + query : ''}`);
  }

  async getCountry(id: string): Promise<ApiResponse<Country>> {
    return this.request<Country>(`/v1/countries/${encodeURIComponent(id)}`);
  }

  // Search
  async search(query: string, options: { lang?: 'zh' | 'en'; limit?: number } = {}): Promise<ApiResponse<Country[]>> {
    const params = new URLSearchParams();
    params.set('q', query);
    if (options.lang) params.set('lang', options.lang);
    if (options.limit) params.set('limit', String(options.limit));

    return this.request<Country[]>(`/v1/search?${params.toString()}`);
  }

  // Health
  async health(): Promise<{ status: string; version: string }> {
    const response = await this.request<{ status: string; version: string }>('/health');
    return response.data;
  }
}

export class NomadApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'NomadApiError';
  }
}

// Default export
export default NomadClient;

// Convenience function for quick usage
export function createClient(options?: ClientOptions): NomadClient {
  return new NomadClient(options);
}
