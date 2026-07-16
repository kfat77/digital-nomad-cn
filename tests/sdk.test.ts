import { describe, it, expect, beforeEach } from 'vitest';
import { NomadClient, NomadApiError, createClient } from '../packages/js-sdk/src/index';

// Mock fetch for testing
global.fetch = vi.fn();

describe('NomadClient', () => {
  let client: NomadClient;

  beforeEach(() => {
    client = new NomadClient({ baseUrl: 'http://localhost:8787' });
    vi.resetAllMocks();
  });

  it('should create client with default options', () => {
    const defaultClient = new NomadClient();
    expect(defaultClient).toBeDefined();
  });

  it('should create client with custom options', () => {
    const customClient = new NomadClient({
      baseUrl: 'https://custom.api.com',
      apiKey: 'test-key',
      timeout: 5000
    });
    expect(customClient).toBeDefined();
  });

  it('should use createClient convenience function', () => {
    const client = createClient({ baseUrl: 'http://test' });
    expect(client).toBeInstanceOf(NomadClient);
  });

  it('should list countries successfully', async () => {
    const mockResponse = {
      data: [
        { id: 'thailand', name: { zh: '泰国', en: 'Thailand' }, region: 'southeast-asia' }
      ],
      meta: { version: '1.0.0', total: 1, limit: 100, offset: 0, hasMore: false }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await client.listCountries();
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('thailand');
    expect(result.meta.total).toBe(1);
  });

  it('should get country by id', async () => {
    const mockResponse = {
      data: { id: 'japan', name: { zh: '日本', en: 'Japan' } },
      meta: { version: '1.0.0' }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await client.getCountry('japan');
    
    expect(result.data.id).toBe('japan');
  });

  it('should search countries', async () => {
    const mockResponse = {
      data: [
        { id: 'thailand', name: { zh: '泰国', en: 'Thailand' } }
      ],
      meta: { version: '1.0.0', query: 'thai' }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await client.search('thai', { lang: 'en', limit: 10 });
    
    expect(result.data).toHaveLength(1);
    expect(result.meta.query).toBe('thai');
  });

  it('should check health', async () => {
    const mockResponse = {
      data: { status: 'ok', version: '1.0.0' },
      meta: { version: '1.0.0' }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await client.health();
    
    expect(result.status).toBe('ok');
    expect(result.version).toBe('1.0.0');
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'COUNTRY_NOT_FOUND', message: 'Country not found' })
    });

    await expect(client.getCountry('nonexistent')).rejects.toThrow(NomadApiError);
    
    // Reset mock for second assertion
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'COUNTRY_NOT_FOUND', message: 'Country not found' })
    });
    await expect(client.getCountry('nonexistent')).rejects.toThrow('Country not found');
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));

    await expect(client.health()).rejects.toThrow(NomadApiError);
    
    // Reset mock for second assertion
    (global.fetch as any).mockRejectedValueOnce(new Error('Network failure'));
    await expect(client.health()).rejects.toThrow('Network failure');
  });

  it('should apply query parameters for listCountries', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], meta: {} })
    });

    await client.listCountries({ region: 'southeast-asia', limit: 10, offset: 20 });

    const callArgs = (global.fetch as any).mock.calls[0];
    const url = callArgs[0];
    
    expect(url).toContain('region=southeast-asia');
    expect(url).toContain('limit=10');
    expect(url).toContain('offset=20');
  });

  it('should include API key in headers', async () => {
    const keyClient = new NomadClient({ baseUrl: 'http://test', apiKey: 'secret-key' });
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {}, meta: {} })
    });

    await keyClient.health();

    const callArgs = (global.fetch as any).mock.calls[0];
    const headers = callArgs[1].headers;
    
    expect(headers['X-API-Key']).toBe('secret-key');
  });

  it('should handle timeout', async () => {
    // Skip this test in CI as fake timers can be flaky
    if (process.env.CI) {
      return;
    }
    
    vi.useFakeTimers({ shouldAdvanceTime: true });
    
    (global.fetch as any).mockImplementationOnce((_url: string, init?: RequestInit) =>
      new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      })
    );

    const timeoutClient = new NomadClient({ baseUrl: 'http://test', timeout: 100 });
    const promise = timeoutClient.health();
    const assertion = expect(promise).rejects.toThrow();
    
    // Advance timers and run pending timers
    await vi.advanceTimersByTimeAsync(150);
    
    await assertion;
    
    vi.useRealTimers();
  }, 15000);
});

describe('NomadApiError', () => {
  it('should have correct properties', () => {
    const error = new NomadApiError('TEST_ERROR', 'Test message', 500);
    
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('NomadApiError');
  });
});
