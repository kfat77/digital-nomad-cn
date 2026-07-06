#!/usr/bin/env node
/**
 * Sync website/ to docs/ for GitHub Pages deployment.
 * Preserves docs/ planning documents that don't exist in website/.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'website');
const DST = path.join(__dirname, '..', 'docs');

// Planning docs that exist in docs/ but not website/ — preserve these
const PRESERVE = new Set([
  '36MONTH_ROADMAP.md',
  'AI_ARCHITECTURE.md',
  'ARCHITECTURE_DESIGN.md',
  'GROWTH_STRATEGY.md',
  'SEO_ARCHITECTURE.md',
]);

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (PRESERVE.has(entry)) continue; // skip planning docs
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      rmrf(full);
      fs.rmdirSync(full);
    } else {
      fs.unlinkSync(full);
    }
  }
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcFull = path.join(src, entry);
    const dstFull = path.join(dst, entry);
    const stat = fs.statSync(srcFull);
    if (stat.isDirectory()) {
      copyDir(srcFull, dstFull);
    } else {
      fs.copyFileSync(srcFull, dstFull);
    }
  }
}

// Step 1: Clean docs/ (except preserved files)
console.log('[1/3] Cleaning docs/ (preserving planning documents)...');
rmrf(DST);

// Step 2: Copy website/ to docs/
console.log('[2/3] Copying website/ to docs/...');
copyDir(SRC, DST);

// Step 3: Verify
const srcCount = fs.readdirSync(SRC).length;
const dstCount = fs.readdirSync(DST).length;
console.log(`[3/3] Done. website/: ${srcCount} items, docs/: ${dstCount} items`);
