import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const visaDocument = JSON.parse(readFileSync(resolve(__dirname, '../docs/api/visas.json'), 'utf-8'));
const visaSchema = JSON.parse(readFileSync(resolve(__dirname, '../docs/data/schemas/visa-detail.json'), 'utf-8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(visaSchema);

describe('Visa data provenance', () => {
  it('requires an official source and review date for every country record', () => {
    const errors = visaDocument.data.flatMap((record: unknown) => {
      if (validate(record)) return [];
      return [ajv.errorsText(validate.errors)];
    });

    expect(errors).toEqual([]);
  });

  it('uses HTTPS official links for every visa type', () => {
    for (const record of visaDocument.data) {
      for (const visa of record.visa_types) {
        expect(visa.official_url).toMatch(/^https:\/\//);
      }
    }
  });
});
