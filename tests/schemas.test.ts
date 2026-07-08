import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const SCHEMAS_DIR = resolve(__dirname, '../schemas');
const DATASETS_DIR = resolve(__dirname, '../datasets');

describe('Schema Registry', () => {
  it('should have valid index.json', () => {
    const index = JSON.parse(readFileSync(resolve(SCHEMAS_DIR, 'index.json'), 'utf-8'));
    
    expect(index.version).toBeDefined();
    expect(index.schemas).toBeDefined();
    expect(index.schemas.country).toBeDefined();
    expect(index.schemas.country.file).toBe('country.schema.json');
  });
});

describe('Country Schema Validation', () => {
  const schema = JSON.parse(readFileSync(resolve(SCHEMAS_DIR, 'country.schema.json'), 'utf-8'));
  const countries = JSON.parse(readFileSync(resolve(DATASETS_DIR, 'countries.json'), 'utf-8'));
  
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  it('schema should be valid JSON Schema', () => {
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(schema.$id).toBeDefined();
    expect(schema.title).toBe('Country');
    expect(schema.required).toContain('id');
    expect(schema.required).toContain('name');
    expect(schema.required).toContain('region');
    expect(schema.required).toContain('status');
    expect(schema.required).toContain('metadata');
  });

  it('all countries should validate against schema', () => {
    const errors: string[] = [];
    
    for (let i = 0; i < countries.length; i++) {
      const valid = validate(countries[i]);
      if (!valid) {
        errors.push(`Country ${countries[i].id || `#${i}`}: ${ajv.errorsText(validate.errors)}`);
      }
    }

    if (errors.length > 0) {
      console.error('Schema validation errors:', errors.slice(0, 10));
    }

    expect(errors).toHaveLength(0);
  });

  it('should detect invalid country data', () => {
    const invalidCountry = {
      id: 'INVALID ID', // Should be lowercase
      name: { zh: '测试' }, // Missing en
      region: 'invalid-region',
      status: 'unknown-status',
      metadata: {}
    };

    const valid = validate(invalidCountry);
    expect(valid).toBe(false);
    expect(validate.errors).toBeDefined();
    expect(validate.errors!.length).toBeGreaterThan(0);
  });
});

describe('Schema Field Types', () => {
  const schema = JSON.parse(readFileSync(resolve(SCHEMAS_DIR, 'country.schema.json'), 'utf-8'));

  it('should define correct types for id field', () => {
    expect(schema.properties.id.type).toBe('string');
    expect(schema.properties.id.pattern).toBeDefined();
  });

  it('should define correct types for name field', () => {
    expect(schema.properties.name.type).toBe('object');
    expect(schema.properties.name.required).toContain('zh');
    expect(schema.properties.name.required).toContain('en');
  });

  it('should define region enum', () => {
    expect(schema.properties.region.enum).toBeDefined();
    expect(schema.properties.region.enum.length).toBeGreaterThan(10);
  });

  it('should define status enum', () => {
    expect(schema.properties.status.enum).toContain('active');
    expect(schema.properties.status.enum).toContain('draft');
    expect(schema.properties.status.enum).toContain('deprecated');
    expect(schema.properties.status.enum).toContain('pending-review');
  });

  it('should define coordinates with valid ranges', () => {
    const coords = schema.properties.coordinates.properties;
    expect(coords.latitude.minimum).toBe(-90);
    expect(coords.latitude.maximum).toBe(90);
    expect(coords.longitude.minimum).toBe(-180);
    expect(coords.longitude.maximum).toBe(180);
  });

  it('should define color with hex pattern', () => {
    expect(schema.properties.color.pattern).toBe('^#[0-9a-fA-F]{6}$');
  });
});
