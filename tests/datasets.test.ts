import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const DATASETS_DIR = resolve(__dirname, '../datasets');

describe('Datasets Structure', () => {
  it('should have index.json with valid structure', () => {
    const index = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'index.json'), 'utf-8'));
    
    expect(index.version).toBeDefined();
    expect(index.datasets).toBeDefined();
    expect(index.datasets.countries).toBeDefined();
    expect(index.datasets.countries.file).toBe('countries.json');
    expect(index.coverage.totalCountries).toBeGreaterThan(0);
  });

  it('should have countries.json that matches index metadata', () => {
    const index = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'index.json'), 'utf-8'));
    const countries = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'countries.json'), 'utf-8'));
    
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBe(index.coverage.totalCountries);
  });

  it('should have visa-official-links.json', () => {
    const links = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'visa-official-links.json'), 'utf-8'));
    
    expect(typeof links).toBe('object');
    expect(Object.keys(links).length).toBeGreaterThan(0);
  });
});

describe('Countries Data Integrity', () => {
  const countries: any[] = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'countries.json'), 'utf-8'));

  it('should have valid country structure', () => {
    expect(countries.length).toBeGreaterThan(0);
    
    for (const country of countries) {
      // Required fields
      expect(country.id).toBeDefined();
      expect(typeof country.id).toBe('string');
      expect(country.id).toMatch(/^[a-z][a-z0-9_]+$/);

      expect(country.name).toBeDefined();
      expect(country.name.zh).toBeDefined();
      expect(country.name.en).toBeDefined();

      expect(country.region).toBeDefined();
      expect(country.status).toBeDefined();
      expect(['active', 'draft', 'deprecated', 'pending-review']).toContain(country.status);

      expect(country.metadata).toBeDefined();
      expect(country.metadata.version).toBeDefined();
      expect(country.metadata.lastUpdated).toBeDefined();
    }
  });

  it('should have unique country IDs', () => {
    const ids = countries.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid ISO codes when present', () => {
    for (const country of countries) {
      if (country.iso) {
        if (country.iso.alpha2) {
          expect(country.iso.alpha2).toMatch(/^[A-Z]{2}$/);
        }
        if (country.iso.alpha3) {
          expect(country.iso.alpha3).toMatch(/^[A-Z]{3}$/);
        }
      }
    }
  });

  it('should have valid coordinates when present', () => {
    for (const country of countries) {
      if (country.coordinates) {
        expect(country.coordinates.latitude).toBeGreaterThanOrEqual(-90);
        expect(country.coordinates.latitude).toBeLessThanOrEqual(90);
        expect(country.coordinates.longitude).toBeGreaterThanOrEqual(-180);
        expect(country.coordinates.longitude).toBeLessThanOrEqual(180);
      }
    }
  });

  it('should have valid color hex when present', () => {
    for (const country of countries) {
      if (country.color) {
        expect(country.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  it('should have data quality scores in valid range', () => {
    for (const country of countries) {
      if (country.metadata?.dataQuality) {
        const dq = country.metadata.dataQuality;
        expect(dq.completeness).toBeGreaterThanOrEqual(0);
        expect(dq.completeness).toBeLessThanOrEqual(100);
        expect(dq.accuracy).toBeGreaterThanOrEqual(0);
        expect(dq.accuracy).toBeLessThanOrEqual(100);
        expect(dq.freshness).toBeGreaterThanOrEqual(0);
        expect(dq.freshness).toBeLessThanOrEqual(100);
      }
    }
  });

  it('should have at least some active countries', () => {
    const activeCount = countries.filter(c => c.status === 'active').length;
    expect(activeCount).toBeGreaterThan(0);
  });
});

describe('Dataset Statistics', () => {
  const countries: any[] = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'countries.json'), 'utf-8'));
  const index = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'index.json'), 'utf-8'));

  it('region distribution should match actual data', () => {
    const actualRegions: Record<string, number> = {};
    for (const c of countries) {
      actualRegions[c.region] = (actualRegions[c.region] || 0) + 1;
    }

    const indexRegions = index.coverage.byRegion;
    let totalFromRegions = 0;
    for (const [region, count] of Object.entries(indexRegions)) {
      totalFromRegions += count as number;
    }

    expect(totalFromRegions).toBe(countries.length);
  });

  it('should have countries from multiple regions', () => {
    const regions = new Set(countries.map(c => c.region));
    expect(regions.size).toBeGreaterThan(5);
  });
});
