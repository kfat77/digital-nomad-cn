import { Router } from './utils/router';
import { countriesRoute } from './routes/countries';
import { searchRoute } from './routes/search';

export interface Env {
  // Cloudflare Workers 环境变量
}

const router = new Router();

// 健康检查
router.get('/health', () => {
  return jsonResponse({ status: 'ok', version: '1.0.0' });
});

// 国家路由
router.get('/v1/countries', countriesRoute.list);
router.get('/v1/countries/:id', countriesRoute.get);

// 搜索路由
router.get('/v1/search', searchRoute.search);

// 404
router.all('*', () => {
  return jsonResponse({ error: 'Not Found', message: 'API endpoint not found' }, 404);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const response = await router.handle(request, url.pathname);

    // Add CORS to all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
};

export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
