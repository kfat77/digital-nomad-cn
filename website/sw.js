// Service Worker for Digital Nomad Guide PWA
// Cache-first strategy with network fallback

const CACHE_VERSION = 'v53';
const STATIC_CACHE = `dn-static-${CACHE_VERSION}`;
const DATA_CACHE = `dn-data-${CACHE_VERSION}`;
const API_CACHE = `dn-api-${CACHE_VERSION}`;

// Core pages to pre-cache ( Chinese + English )
const CORE_PAGES = [
  '/digital-nomad-cn/',
  '/digital-nomad-cn/index.html',
  '/digital-nomad-cn/style.css',
  '/digital-nomad-cn/app.js',
  '/digital-nomad-cn/countries-data.js',
  '/digital-nomad-cn/manifest.json',
  '/digital-nomad-cn/country/',
  '/digital-nomad-cn/country/index.html',
  '/digital-nomad-cn/visa/',
  '/digital-nomad-cn/visa/index.html',
  '/digital-nomad-cn/city/',
  '/digital-nomad-cn/city/index.html',
  '/digital-nomad-cn/compare/',
  '/digital-nomad-cn/compare/index.html',
  '/digital-nomad-cn/search/',
  '/digital-nomad-cn/search/index.html',
  '/digital-nomad-cn/routes/',
  '/digital-nomad-cn/routes/index.html',
  '/digital-nomad-cn/recommend/',
  '/digital-nomad-cn/recommend/index.html',
  '/digital-nomad-cn/en/',
  '/digital-nomad-cn/en/index.html',
  '/digital-nomad-cn/en/app-en.js',
  '/digital-nomad-cn/en/countries/',
  '/digital-nomad-cn/en/countries/index.html',
  '/digital-nomad-cn/en/visas/',
  '/digital-nomad-cn/en/visas/index.html',
  '/digital-nomad-cn/en/cities/',
  '/digital-nomad-cn/en/cities/index.html',
  '/digital-nomad-cn/en/compare/',
  '/digital-nomad-cn/en/compare/index.html',
  '/digital-nomad-cn/en/search/',
  '/digital-nomad-cn/en/search/index.html',
  '/digital-nomad-cn/en/routes/',
  '/digital-nomad-cn/en/routes/index.html',
  '/digital-nomad-cn/en/recommend/',
  '/digital-nomad-cn/en/recommend/index.html',
  '/digital-nomad-cn/assistant/',
  '/digital-nomad-cn/assistant/index.html',
  '/digital-nomad-cn/en/assistant/',
  '/digital-nomad-cn/en/assistant/index.html',
  // CDN assets
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
  'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap',
];

// API endpoints to cache (stale-while-revalidate)
const API_ENDPOINTS = [
  '/digital-nomad-cn/api/countries.json',
  '/digital-nomad-cn/api/cities.json',
  '/digital-nomad-cn/api/visas.json',
  '/digital-nomad-cn/api/stats.json',
  '/digital-nomad-cn/api/manifest.json',
  '/digital-nomad-cn/data/updated-at.json',
  '/digital-nomad-cn/data/exchange-rates.json',
];

// Install: pre-cache core pages
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CORE_PAGES))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE && key !== API_CACHE) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and Chrome extensions
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API endpoints: stale-while-revalidate
  if (API_ENDPOINTS.some(path => url.pathname.includes(path.split('/').pop()))) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Static assets: cache-first, network fallback
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages: cache-first, network fallback (offline fallback to index.html)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      cacheFirstWithFallback(request, STATIC_CACHE, '/digital-nomad-cn/index.html')
    );
    return;
  }

  // Default: network-first with cache fallback
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

function isStaticAsset(url) {
  const staticExts = ['.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf'];
  return staticExts.some(ext => url.pathname.endsWith(ext)) || url.host === 'fonts.googleapis.com';
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function cacheFirstWithFallback(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    const fallback = await cache.match(fallbackUrl);
    return fallback || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// Message handler for manual cache updates
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
