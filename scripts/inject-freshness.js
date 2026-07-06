#!/usr/bin/env node
/**
 * Inject data freshness indicators into country pages
 * Reads datasets/countries.json and adds "last updated" badges
 */

const fs = require('fs');
const path = require('path');

const DATASET_PATH = path.join(__dirname, '..', 'datasets', 'countries.json');
const WEBSITE_DIR = path.join(__dirname, '..', 'website');

function formatDate(dateStr) {
  if (!dateStr) return { formatted: '未知', freshnessClass: 'stale', freshnessText: '(从未更新)', diffDays: 9999 };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { formatted: '未知', freshnessClass: 'stale', freshnessText: '(从未更新)', diffDays: 9999 };
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let freshnessClass = 'fresh';
  let freshnessText = '';

  if (diffDays > 90) {
    freshnessClass = 'stale';
    freshnessText = `(${diffDays}天前)`;
  } else if (diffDays > 60) {
    freshnessClass = 'warning';
    freshnessText = `(${diffDays}天前)`;
  } else if (diffDays > 30) {
    freshnessClass = 'aging';
    freshnessText = `(${diffDays}天前)`;
  } else {
    freshnessText = diffDays <= 1 ? '(刚刚)' : `(${diffDays}天前)`;
  }

  const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { formatted, freshnessClass, freshnessText, diffDays };
}

function injectFreshness() {
  if (!fs.existsSync(DATASET_PATH)) {
    console.log('❌ datasets/countries.json not found');
    return;
  }

  const data = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
  const countries = Array.isArray(data) ? data : (data.countries || []);
  let updated = 0;

  const freshnessCSS = '\n        .freshness-badge { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: var(--radius-full); font-weight: 500; }\n        .freshness-badge.fresh { background: rgba(34,197,94,0.15); color: #16a34a; }\n        .freshness-badge.aging { background: rgba(234,179,8,0.15); color: #ca8a04; }\n        .freshness-badge.warning { background: rgba(249,115,22,0.15); color: #ea580c; }\n        .freshness-badge.stale { background: rgba(239,68,68,0.15); color: #dc2626; }\n        .freshness-badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; display: inline-block; }\n        .freshness-badge.fresh::before { background: #16a34a; }\n        .freshness-badge.aging::before { background: #ca8a04; }\n        .freshness-badge.warning::before { background: #ea580c; }\n        .freshness-badge.stale::before { background: #dc2626; }';

  for (const country of countries) {
    const id = country.id;
    const lastUpdated = country.metadata?.lastUpdated;
    const freshness = formatDate(lastUpdated);

    const paths = [
      path.join(WEBSITE_DIR, 'country', `${id}.html`),
      path.join(WEBSITE_DIR, 'country', id, 'index.html'),
      path.join(WEBSITE_DIR, 'en', 'country', `${id}.html`),
      path.join(WEBSITE_DIR, 'en', 'country', id, 'index.html'),
    ];

    for (const filePath of paths) {
      if (!fs.existsSync(filePath)) continue;

      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('class="freshness-badge"')) continue;

      const lastStyleEnd = content.lastIndexOf('</style>');
      if (lastStyleEnd !== -1 && !content.includes('.freshness-badge')) {
        content = content.slice(0, lastStyleEnd) + freshnessCSS + '\n    ' + content.slice(lastStyleEnd);
      }

      const badgesPattern = /(<div class="country-hero-badges"[^>]*>.*?<\/div>)/s;
      const badgesMatch = content.match(badgesPattern);

      if (badgesMatch) {
        const badgeHTML = `<span class="freshness-badge ${freshness.freshnessClass}">数据更新于 ${freshness.formatted} ${freshness.freshnessText}</span>`;
        content = content.replace(badgesPattern, badgesMatch[1] + '\n                    ' + badgeHTML);
        fs.writeFileSync(filePath, content, 'utf8');
        updated++;
        console.log(`  ✅ ${filePath.replace(WEBSITE_DIR + path.sep, '').replace(/\\/g, '/')} → ${freshness.formatted} ${freshness.freshnessText}`);
        continue;
      }

      const scorePattern = /(<div class="score-badge"[^>]*>.*?<\/div>)/s;
      const scoreMatch = content.match(scorePattern);
      if (scoreMatch) {
        const badgeHTML = `<div class="freshness-badge ${freshness.freshnessClass}">数据更新于 ${freshness.formatted} ${freshness.freshnessText}</div>`;
        content = content.replace(scorePattern, scoreMatch[1] + '\n        ' + badgeHTML);
        fs.writeFileSync(filePath, content, 'utf8');
        updated++;
        console.log(`  ✅ ${filePath.replace(WEBSITE_DIR + path.sep, '').replace(/\\/g, '/')} → ${freshness.formatted} ${freshness.freshnessText}`);
        continue;
      }

      console.log(`  ⚠️ ${filePath.replace(WEBSITE_DIR + path.sep, '').replace(/\\/g, '/')} → could not find injection point`);
    }
  }

  console.log(`\n📊 Injected freshness badges into ${updated} country pages`);
}

injectFreshness();
