#!/usr/bin/env node
/**
 * Bump Service Worker cache version
 * Automatically increments CACHE_VERSION in website/sw.js
 * and syncs to docs/sw.js if present.
 */

const fs = require('fs');
const path = require('path');

const SW_FILES = [
  path.join(__dirname, '..', 'website', 'sw.js'),
  path.join(__dirname, '..', 'docs', 'sw.js'),
];

function bumpVersion(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[skip] ${path.relative(process.cwd(), filePath)} does not exist`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Match: const CACHE_VERSION = 'v57';
  const match = content.match(/const CACHE_VERSION = 'v(\d+)'/);
  if (!match) {
    console.log(`[warn] ${path.relative(process.cwd(), filePath)} — CACHE_VERSION not found`);
    return false;
  }

  const currentVersion = parseInt(match[1], 10);
  const newVersion = currentVersion + 1;

  content = content.replace(
    /const CACHE_VERSION = 'v\d+'/,
    `const CACHE_VERSION = 'v${newVersion}'`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[bump] ${path.relative(process.cwd(), filePath)}: v${currentVersion} → v${newVersion}`);
  return true;
}

let changed = false;
for (const file of SW_FILES) {
  if (bumpVersion(file)) changed = true;
}

if (changed) {
  console.log('[ok] Service Worker cache version bumped');
  process.exit(0);
} else {
  console.log('[warn] No Service Worker files were updated');
  process.exit(1);
}
