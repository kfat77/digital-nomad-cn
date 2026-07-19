#!/usr/bin/env node
/**
 * Generate docs/sitemap.xml by scanning HTML under docs/.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const BASE = 'https://kfat77.github.io/digital-nomad-cn';

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const files = walk(DOCS);
const urls = files
  .map((f) => {
    let rel = path.relative(DOCS, f).split(path.sep).join('/');
    if (rel === '404.html') return null;
    if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
    else if (rel === 'index.html') rel = '';
    const loc = `${BASE}/${rel}`.replace(/([^:]\/)\/+/g, '$1');
    return loc.endsWith('/') && loc !== `${BASE}/` ? loc.slice(0, -1) + '/' : loc;
  })
  .filter(Boolean);

// Prefer unique URLs (flat vs index dual paths may both exist)
const unique = [...new Set(urls)].sort();

const today = new Date().toISOString().slice(0, 10);
const body = unique
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const out = path.join(DOCS, 'sitemap.xml');
fs.writeFileSync(out, xml, 'utf8');
console.log(`✅ Wrote ${out} (${unique.length} URLs)`);
