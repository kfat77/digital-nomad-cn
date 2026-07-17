import { readFileSync } from 'fs';
import { resolve } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

const datasets = resolve(__dirname, '../datasets');
const reviewed = JSON.parse(readFileSync(resolve(datasets, 'reviewed-countries.json'), 'utf8'));
const countries = JSON.parse(readFileSync(resolve(datasets, 'countries.json'), 'utf8'));
const schema = JSON.parse(readFileSync(resolve(__dirname, '../schemas/reviewed-country.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

describe('reviewed country contract', () => {
  it('has a schema-valid official-source record for every reviewed country', () => {
    expect(validate(reviewed), ajv.errorsText(validate.errors)).toBe(true);
    expect(reviewed.length).toBeGreaterThanOrEqual(10);
  });

  it('only reviews countries in the core dataset and records a visa source', () => {
    const ids = new Set(countries.map((country: { id: string }) => country.id));
    for (const record of reviewed) {
      expect(ids.has(record.country_id)).toBe(true);
      expect(record.reviewed_fields).toContain('visa_entry');
      expect(record.sources.some((source: { field: string }) => source.field === 'visa_entry')).toBe(true);
      for (const source of record.sources) {
        expect(record.reviewed_fields).toContain(source.field);
      }
    }
  });

  it('does not advertise reference-only fields as officially reviewed', () => {
    for (const record of reviewed) {
      expect(record.reviewed_fields).not.toContain('cost_of_living');
      expect(record.reviewed_fields).not.toContain('internet_speed');
      expect(record.reviewed_fields).not.toContain('safety');
    }
  });
});
