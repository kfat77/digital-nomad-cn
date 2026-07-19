#!/usr/bin/env node
/**
 * Sync derived site assets into docs/ (GitHub Pages root).
 *
 * Historical note: an older layout used website/ → docs/.
 * The live site root is now docs/. This script regenerates
 * data-driven assets from datasets/ into docs/ without deleting pages.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const websiteDir = path.join(ROOT, 'website');

function run(script) {
  console.log(`→ node ${script}`);
  execSync(`node ${path.join('scripts', script)}`, { cwd: ROOT, stdio: 'inherit' });
}

console.log('Sync derived assets into docs/ …');

// Optional legacy path: if website/ still exists, mirror non-destructive copies
if (fs.existsSync(websiteDir)) {
  console.log('ℹ️  website/ found — leaving in place (docs/ remains deploy root)');
}

run('generate-countries-data.js');
run('update-dataset-stats.js');

console.log('✅ sync-to-docs complete (docs/ is GitHub Pages root)');
