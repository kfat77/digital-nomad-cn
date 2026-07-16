import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const homepage = readFileSync(resolve(__dirname, '../docs/index.html'), 'utf8');

describe('homepage quick start', () => {
  it('puts the three pre-departure essentials on the homepage', () => {
    expect(homepage).toContain('出海前要做的三件事');
    expect(homepage).toContain('银行卡');
    expect(homepage).toContain('电话卡');
    expect(homepage).toContain('证券账户');
  });

  it('does not load the retired 3D globe', () => {
    expect(homepage).not.toContain('globe.js');
    expect(homepage).not.toContain('globe-viz');
  });
});
