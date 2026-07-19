#!/usr/bin/env node
/**
 * Bump Service Worker cache version in docs/sw.js so clients refresh assets.
 */
const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'docs', 'sw.js');
if (!fs.existsSync(swPath)) {
  console.error('❌ docs/sw.js not found');
  process.exit(1);
}

let content = fs.readFileSync(swPath, 'utf8');
const match = content.match(/const CACHE_VERSION = ['"]v(\d+)['"]/);
if (!match) {
  console.error('❌ CACHE_VERSION not found in docs/sw.js');
  process.exit(1);
}

const next = parseInt(match[1], 10) + 1;
content = content.replace(
  /const CACHE_VERSION = ['"]v\d+['"]/,
  `const CACHE_VERSION = 'v${next}'`
);
fs.writeFileSync(swPath, content, 'utf8');
console.log(`✅ Bumped Service Worker cache: v${match[1]} → v${next}`);
