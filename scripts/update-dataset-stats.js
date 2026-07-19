#!/usr/bin/env node
/**
 * Regenerate datasets/index.json coverage + datasets/_stats.json from countries.json.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATASETS = path.join(ROOT, 'datasets');
const countries = JSON.parse(fs.readFileSync(path.join(DATASETS, 'countries.json'), 'utf8'));
const now = new Date().toISOString();

const byRegion = {};
let withInfo = 0;
let completenessSum = 0;
let accuracySum = 0;
let freshnessSum = 0;
let withQuality = 0;

for (const c of countries) {
  byRegion[c.region] = (byRegion[c.region] || 0) + 1;
  if (c.info && Object.keys(c.info).length > 0) withInfo++;
  const dq = c.metadata?.dataQuality;
  if (dq) {
    completenessSum += dq.completeness || 0;
    accuracySum += dq.accuracy || 0;
    freshnessSum += dq.freshness || 0;
    withQuality++;
  }
}

const n = countries.length || 1;
const avg = (sum) => Math.round((sum / (withQuality || n)) * 10) / 10;

const stats = {
  totalCountries: countries.length,
  withInfo,
  byRegion,
  generatedAt: now,
};

fs.writeFileSync(path.join(DATASETS, '_stats.json'), JSON.stringify(stats, null, 2) + '\n');

const indexPath = path.join(DATASETS, 'index.json');
const index = fs.existsSync(indexPath)
  ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  : { version: '2.0.0', description: 'Digital Nomad CN 数据集总索引', datasets: {} };

index.lastUpdated = now;
index.coverage = {
  totalCountries: countries.length,
  withDetailedInfo: withInfo,
  byRegion: { ...byRegion },
};
index.stats = {
  infoCategories: index.stats?.infoCategories || {
    visa: 0,
    bank: 0,
    phone: 0,
    identity: 0,
    tools: 0,
  },
  dataQuality: {
    averageCompleteness: avg(completenessSum),
    averageAccuracy: avg(accuracySum),
    averageFreshness: avg(freshnessSum),
  },
};

if (index.datasets?.countries) {
  index.datasets.countries.count = countries.length;
  index.datasets.countries.lastUpdated = now;
  index.datasets.countries.file = 'countries.json';
  index.datasets.countries.schema = 'country.schema.json';
}

if (fs.existsSync(path.join(DATASETS, 'china-passport.json'))) {
  const cp = JSON.parse(fs.readFileSync(path.join(DATASETS, 'china-passport.json'), 'utf8'));
  index.datasets['china-passport'] = {
    file: 'china-passport.json',
    count: Array.isArray(cp) ? cp.length : undefined,
    schema: null,
    lastUpdated: now,
    description: '中国护照友好国家签证便利数据',
  };
}

if (fs.existsSync(path.join(DATASETS, 'visa-official-links.json'))) {
  index.datasets['visa-official-links'] = index.datasets['visa-official-links'] || {
    file: 'visa-official-links.json',
    schema: null,
    description: '各国签证官方链接',
  };
  index.datasets['visa-official-links'].lastUpdated = now;
}

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');

console.log('✅ Updated datasets/_stats.json and datasets/index.json');
console.log(`   countries=${countries.length} withInfo=${withInfo}`);
