import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadCountries,
  getCountryById,
  searchCountries,
  getRegions,
  getRegionStats,
  recommendCountries
} from '../packages/mcp-server/src/data-loader';

// Mock fs
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn()
}));

vi.mock('path', () => ({
  resolve: vi.fn((...args: string[]) => args.join('/'))
}));

import * as fs from 'fs';

describe('Data Loader', () => {
  const mockCountries = [
    {
      id: 'thailand',
      iso: { alpha2: 'TH', alpha3: 'THA' },
      name: { zh: '泰国', en: 'Thailand' },
      region: 'southeast-asia',
      coordinates: { latitude: 15.0, longitude: 100.0 },
      color: '#FF0000',
      info: {},
      status: 'active',
      metadata: {
        version: '2.0.0',
        lastUpdated: '2026-01-01T00:00:00Z',
        dataQuality: { completeness: 80, accuracy: 90, freshness: 70 }
      }
    },
    {
      id: 'japan',
      iso: { alpha2: 'JP', alpha3: 'JPN' },
      name: { zh: '日本', en: 'Japan' },
      region: 'east-asia',
      coordinates: { latitude: 36.0, longitude: 138.0 },
      color: '#0000FF',
      info: {},
      status: 'active',
      metadata: {
        version: '2.0.0',
        lastUpdated: '2026-01-01T00:00:00Z',
        dataQuality: { completeness: 95, accuracy: 95, freshness: 90 }
      }
    },
    {
      id: 'draft-country',
      iso: { alpha2: 'XX', alpha3: 'XXX' },
      name: { zh: '草稿国', en: 'Draft Country' },
      region: 'southeast-asia',
      coordinates: { latitude: 10.0, longitude: 105.0 },
      color: '#00FF00',
      info: {},
      status: 'draft',
      metadata: {
        version: '2.0.0',
        lastUpdated: '2026-01-01T00:00:00Z',
        dataQuality: { completeness: 30, accuracy: 50, freshness: 40 }
      }
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Reset the module cache to clear countriesCache
    vi.resetModules();
    
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockCountries));
  });

  it('should load countries from file', () => {
    const countries = loadCountries();
    
    expect(countries).toHaveLength(3);
    expect(countries[0].id).toBe('thailand');
  });

  it('should cache countries data', () => {
    // First call loads from file
    const first = loadCountries();
    // Second call should use cache
    const second = loadCountries();
    
    // Both should return same data
    expect(first).toBe(second);
    expect(first).toHaveLength(3);
  });

  it('should get country by id', () => {
    const country = getCountryById('japan');
    
    expect(country).toBeDefined();
    expect(country?.name.en).toBe('Japan');
  });

  it('should return undefined for unknown country', () => {
    const country = getCountryById('nonexistent');
    
    expect(country).toBeUndefined();
  });

  it('should search countries by keyword', () => {
    const results = searchCountries({ keyword: 'thai' });
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('thailand');
  });

  it('should search countries by region', () => {
    const results = searchCountries({ region: 'southeast-asia' });
    
    expect(results).toHaveLength(2);
    expect(results.map(c => c.id)).toContain('thailand');
    expect(results.map(c => c.id)).toContain('draft-country');
  });

  it('should search countries by status', () => {
    const results = searchCountries({ status: 'active' });
    
    expect(results).toHaveLength(2);
    expect(results.every(c => c.status === 'active')).toBe(true);
  });

  it('should search with combined filters', () => {
    const results = searchCountries({ 
      region: 'southeast-asia', 
      status: 'active' 
    });
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('thailand');
  });

  it('should search by Chinese name', () => {
    const results = searchCountries({ keyword: '日本' });
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('japan');
  });

  it('should search by ISO code', () => {
    const results = searchCountries({ keyword: 'JP' });
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('japan');
  });

  it('should return all regions', () => {
    const regions = getRegions();
    
    expect(regions).toContain('southeast-asia');
    expect(regions).toContain('east-asia');
    expect(regions.length).toBe(2);
  });

  it('should return region stats', () => {
    const stats = getRegionStats();
    
    expect(stats).toHaveLength(2);
    
    const seAsia = stats.find(s => s.region === 'southeast-asia');
    expect(seAsia).toBeDefined();
    expect(seAsia?.count).toBe(2);
    expect(seAsia?.active).toBe(1);
    expect(seAsia?.draft).toBe(1);
  });

  it('should recommend countries', () => {
    const results = recommendCountries({ status: 'active' });
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].status).toBe('active');
  });

  it('should filter recommendations by region', () => {
    const results = recommendCountries({ 
      regions: ['east-asia'],
      status: 'active' 
    });
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('japan');
  });

  it('should exclude regions from recommendations', () => {
    const results = recommendCountries({ 
      avoidRegions: ['east-asia'],
      status: 'active' 
    });
    
    expect(results.some(c => c.region === 'east-asia')).toBe(false);
  });

  it('should sort recommendations by data quality', () => {
    const results = recommendCountries({ status: 'active' });
    
    // Japan has higher completeness (95) than Thailand (80)
    expect(results[0].id).toBe('japan');
    expect(results[1].id).toBe('thailand');
  });
});
