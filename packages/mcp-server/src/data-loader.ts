import * as fs from 'fs';
import * as path from 'path';

export interface Country {
  id: string;
  iso: { alpha2: string; alpha3: string };
  name: { zh: string; en: string };
  region: string;
  coordinates: { latitude: number; longitude: number };
  color: string;
  info: Record<string, any>;
  status: 'active' | 'draft' | 'deprecated';
  metadata: {
    version: string;
    lastUpdated: string;
    dataQuality: {
      completeness: number;
      accuracy: number;
      freshness: number;
    };
  };
}

let countriesCache: Country[] | null = null;

export function loadCountries(): Country[] {
  if (countriesCache) return countriesCache;

  // Try multiple paths to find the dataset
  const possiblePaths = [
    path.resolve(__dirname, '../../../datasets/countries.json'),
    path.resolve(process.cwd(), 'datasets/countries.json'),
    path.resolve(process.cwd(), '../datasets/countries.json'),
    path.resolve(process.cwd(), '../../datasets/countries.json'),
  ];

  let data: string | null = null;
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        data = fs.readFileSync(p, 'utf-8');
        break;
      }
    } catch { /* ignore */ }
  }

  // Fallback: fetch from GitHub raw
  if (!data) {
    throw new Error(
      'Could not find datasets/countries.json. ' +
      'Please ensure the digital-nomad-cn repository datasets/ directory is accessible.'
    );
  }

  countriesCache = JSON.parse(data) as Country[];
  return countriesCache;
}

export function getCountryById(id: string): Country | undefined {
  return loadCountries().find(c => c.id === id);
}

export function searchCountries(query: {
  region?: string;
  status?: string;
  keyword?: string;
}): Country[] {
  let results = loadCountries();

  if (query.region) {
    results = results.filter(c => c.region === query.region);
  }

  if (query.status) {
    results = results.filter(c => c.status === query.status);
  }

  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    results = results.filter(c =>
      c.id.toLowerCase().includes(kw) ||
      c.name.zh.includes(query.keyword!) ||
      c.name.en.toLowerCase().includes(kw) ||
      c.iso.alpha2.toLowerCase() === kw ||
      c.iso.alpha3.toLowerCase() === kw
    );
  }

  return results;
}

export function getRegions(): string[] {
  const countries = loadCountries();
  const regions = new Set(countries.map(c => c.region));
  return Array.from(regions).sort();
}

export function getRegionStats(): Array<{
  region: string;
  count: number;
  active: number;
  draft: number;
}> {
  const countries = loadCountries();
  const stats: Record<string, { count: number; active: number; draft: number }> = {};

  for (const c of countries) {
    if (!stats[c.region]) {
      stats[c.region] = { count: 0, active: 0, draft: 0 };
    }
    stats[c.region].count++;
    if (c.status === 'active') stats[c.region].active++;
    if (c.status === 'draft') stats[c.region].draft++;
  }

  return Object.entries(stats)
    .map(([region, s]) => ({ region, ...s }))
    .sort((a, b) => b.count - a.count);
}

export function recommendCountries(preferences: {
  regions?: string[];
  status?: 'active' | 'draft';
  avoidRegions?: string[];
}): Country[] {
  let results = loadCountries();

  if (preferences.regions && preferences.regions.length > 0) {
    results = results.filter(c => preferences.regions!.includes(c.region));
  }

  if (preferences.avoidRegions && preferences.avoidRegions.length > 0) {
    results = results.filter(c => !preferences.avoidRegions!.includes(c.region));
  }

  if (preferences.status) {
    results = results.filter(c => c.status === preferences.status);
  }

  // Sort: active first, then by data quality completeness
  return results.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return (b.metadata?.dataQuality?.completeness || 0) - (a.metadata?.dataQuality?.completeness || 0);
  });
}
