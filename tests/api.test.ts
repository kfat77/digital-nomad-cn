import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from '../api/src/utils/router';
import { jsonResponse } from '../api/src/index';

describe('API Router', () => {
  let router: Router;

  beforeEach(() => {
    router = new Router();
  });

  it('should match exact paths', async () => {
    let called = false;
    router.get('/health', async () => {
      called = true;
      return jsonResponse({ status: 'ok' });
    });

    const request = new Request('http://localhost/health');
    const response = await router.handle(request, '/health');

    expect(called).toBe(true);
    expect(response.status).toBe(200);
  });

  it('should extract path parameters', async () => {
    let capturedId = '';
    router.get('/v1/countries/:id', async (req, params) => {
      capturedId = params.id;
      return jsonResponse({ id: params.id });
    });

    const request = new Request('http://localhost/v1/countries/thailand');
    const response = await router.handle(request, '/v1/countries/thailand');

    expect(capturedId).toBe('thailand');
    expect(response.status).toBe(200);
  });

  it('should return 404 for unmatched routes', async () => {
    router.get('/health', async () => jsonResponse({ status: 'ok' }));

    const request = new Request('http://localhost/unknown');
    const response = await router.handle(request, '/unknown');

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('NOT_FOUND');
  });

  it('should handle POST requests', async () => {
    let receivedBody: any = null;
    router.post('/graphql', async (req) => {
      receivedBody = await req.json();
      return jsonResponse({ data: {} });
    });

    const request = new Request('http://localhost/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ countries { id } }' })
    });
    const response = await router.handle(request, '/graphql');

    expect(receivedBody).toEqual({ query: '{ countries { id } }' });
    expect(response.status).toBe(200);
  });

  it('should handle wildcard routes', async () => {
    let caughtPath = '';
    router.all('*', async (req, params) => {
      caughtPath = 'caught';
      return jsonResponse({ message: 'fallback' });
    });

    const request = new Request('http://localhost/anything');
    const response = await router.handle(request, '/anything');

    expect(caughtPath).toBe('caught');
    expect(response.status).toBe(200);
  });

  it('should handle errors gracefully', async () => {
    router.get('/error', async () => {
      throw new Error('Test error');
    });

    const request = new Request('http://localhost/error');
    const response = await router.handle(request, '/error');

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('INTERNAL_ERROR');
  });

  it('should not match GET route with POST request', async () => {
    let getCalled = false;
    router.get('/resource', async () => {
      getCalled = true;
      return jsonResponse({ method: 'GET' });
    });

    const request = new Request('http://localhost/resource', { method: 'POST' });
    const response = await router.handle(request, '/resource');

    expect(getCalled).toBe(false);
    expect(response.status).toBe(404);
  });
});

describe('jsonResponse helper', () => {
  it('should create JSON response with default status 200', async () => {
    const response = jsonResponse({ message: 'hello' });
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    
    const body = await response.json();
    expect(body).toEqual({ message: 'hello' });
  });

  it('should create JSON response with custom status', async () => {
    const response = jsonResponse({ error: 'not found' }, 404);
    
    expect(response.status).toBe(404);
    
    const body = await response.json();
    expect(body.error).toBe('not found');
  });
});
