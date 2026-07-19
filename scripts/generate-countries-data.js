#!/usr/bin/env node
/**
 * Generate docs/countries-data.js from datasets/countries.json.
 * Preserves the COUNTRY_DATA global used by the GitHub Pages site.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const countries = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'datasets', 'countries.json'), 'utf8')
);

function hexToNumber(hex) {
  if (!hex || typeof hex !== 'string') return 0x3b82f6;
  const h = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return 0x3b82f6;
  return parseInt(h, 16);
}

const lines = [];
lines.push('// AUTO-GENERATED from datasets/countries.json — do not edit by hand');
lines.push(`// Generated: ${new Date().toISOString()}`);
lines.push('const COUNTRY_DATA = {');

const sorted = [...countries].sort((a, b) => a.id.localeCompare(b.id));
for (const c of sorted) {
  const lat = c.coordinates?.latitude ?? 0;
  const lon = c.coordinates?.longitude ?? 0;
  const color = hexToNumber(c.color);
  const name = (c.name?.zh || c.id).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const nameEn = (c.name?.en || c.id).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  lines.push(`  ${c.id}: {`);
  lines.push(`    name: "${name}",`);
  lines.push(`    nameEn: "${nameEn}",`);
  lines.push(`    lat: ${lat},`);
  lines.push(`    lon: ${lon},`);
  lines.push(`    color: 0x${color.toString(16)}`);
  lines.push('  },');
}

lines.push('};');
lines.push('');

const outPath = path.join(ROOT, 'docs', 'countries-data.js');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`✅ Wrote ${outPath} (${sorted.length} countries)`);
