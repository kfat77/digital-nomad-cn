import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const globeSource = readFileSync(resolve(__dirname, '../docs/globe.js'), 'utf8');

describe('digital globe', () => {
  it('uses procedural data layers instead of an external Earth texture', () => {
    expect(globeSource).not.toContain('earth-blue-marble');
    expect(globeSource).toContain('createLatitudeLongitudeGrid');
    expect(globeSource).toContain('createDataRoutes');
  });

  it('respects the user preference for reduced motion', () => {
    expect(globeSource).toContain('prefers-reduced-motion');
  });
});
