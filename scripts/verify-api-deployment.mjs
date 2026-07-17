const baseUrl = process.env.API_BASE_URL;

if (!baseUrl) {
  console.error('API_BASE_URL is required, for example: https://api.digital-nomad.cn');
  process.exit(1);
}

const healthUrl = new URL('/health', baseUrl).toString();
const response = await fetch(healthUrl, { headers: { Accept: 'application/json' } });
if (!response.ok) {
  throw new Error(`API health check failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
if (payload.status !== 'ok' || typeof payload.version !== 'string') {
  throw new Error('API health response must include status="ok" and a version string');
}

console.log(`API healthy: ${healthUrl} (v${payload.version})`);
