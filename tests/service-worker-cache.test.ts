import { readFileSync } from 'fs';
import { resolve } from 'path';
import { runInNewContext } from 'vm';
import { describe, expect, it, vi } from 'vitest';

describe('service worker navigation caching', () => {
  it('prefers a fresh page over a previously cached page', async () => {
    const handlers = new Map<string, (event: any) => void>();
    const stalePage = new Response('stale page');
    const freshPage = new Response('fresh page');
    const fetch = vi.fn().mockResolvedValue(freshPage);
    let responsePromise: Promise<Response> | undefined;

    const cache = {
      match: vi.fn().mockResolvedValue(stalePage),
      put: vi.fn(),
      keys: vi.fn().mockResolvedValue([]),
      addAll: vi.fn(),
    };
    const source = readFileSync(resolve(__dirname, '../docs/sw.js'), 'utf8');

    runInNewContext(source, {
      URL,
      Response,
      Promise,
      console,
      fetch,
      caches: {
        open: vi.fn().mockResolvedValue(cache),
        keys: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      },
      self: {
        addEventListener: (type: string, handler: (event: any) => void) => handlers.set(type, handler),
        skipWaiting: vi.fn(),
        clients: { claim: vi.fn() },
      },
    });

    handlers.get('fetch')!({
      request: new Request('https://kfat77.github.io/digital-nomad-cn/', { headers: { accept: 'text/html' } }),
      respondWith: (promise: Promise<Response>) => { responsePromise = promise; },
    });

    expect(await (await responsePromise!).text()).toBe('fresh page');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(cache.put).toHaveBeenCalledTimes(1);
  });
});
