#!/usr/bin/env node
/**
 * Validate datasets against schemas and data-quality rules.
 * Exit 0 on success, 1 on failure.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATASETS = path.join(ROOT, 'datasets');
const SCHEMAS = path.join(ROOT, 'schemas');

let errors = 0;
let warnings = 0;

function fail(msg) {
  console.error('❌', msg);
  errors++;
}

function warn(msg) {
  console.warn('⚠️ ', msg);
  warnings++;
}

function ok(msg) {
  console.log('✅', msg);
}

// --- Load data ---
const countriesPath = path.join(DATASETS, 'countries.json');
const schemaPath = path.join(SCHEMAS, 'country.schema.json');
const indexPath = path.join(DATASETS, 'index.json');

if (!fs.existsSync(countriesPath)) {
  fail('datasets/countries.json missing');
  process.exit(1);
}

const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const index = fs.existsSync(indexPath)
  ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  : null;

if (!Array.isArray(countries)) {
  fail('countries.json must be a JSON array');
  process.exit(1);
}

ok(`Loaded ${countries.length} countries`);

// --- JSON syntax for other datasets ---
for (const file of fs.readdirSync(DATASETS).filter((f) => f.endsWith('.json'))) {
  try {
    JSON.parse(fs.readFileSync(path.join(DATASETS, file), 'utf8'));
  } catch (e) {
    fail(`${file}: invalid JSON — ${e.message}`);
  }
}

// --- Schema validation (Ajv if available) ---
try {
  const Ajv = require('ajv');
  const addFormats = require('ajv-formats');
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const schemaErrors = [];
  for (let i = 0; i < countries.length; i++) {
    if (!validate(countries[i])) {
      schemaErrors.push(
        `${countries[i].id || `#${i}`}: ${ajv.errorsText(validate.errors)}`
      );
    }
  }
  if (schemaErrors.length) {
    schemaErrors.slice(0, 20).forEach((e) => fail(e));
    if (schemaErrors.length > 20) fail(`… and ${schemaErrors.length - 20} more schema errors`);
  } else {
    ok('All countries validate against country.schema.json');
  }
} catch (e) {
  warn(`Ajv not available (${e.message}); running structural checks only`);
  for (const c of countries) {
    if (!c.id || !c.name?.zh || !c.name?.en || !c.region || !c.status || !c.metadata) {
      fail(`${c.id || '?'}: missing required fields`);
    }
  }
}

// --- Uniqueness ---
const ids = new Set();
const alpha2 = new Map();
const alpha3 = new Map();

for (const c of countries) {
  if (ids.has(c.id)) fail(`Duplicate id: ${c.id}`);
  ids.add(c.id);

  if (!c.iso?.alpha2 || !c.iso?.alpha3) {
    fail(`${c.id}: missing iso.alpha2 or iso.alpha3`);
    continue;
  }
  if (!/^[A-Z]{2}$/.test(c.iso.alpha2)) fail(`${c.id}: invalid alpha2 ${c.iso.alpha2}`);
  if (!/^[A-Z]{3}$/.test(c.iso.alpha3)) fail(`${c.id}: invalid alpha3 ${c.iso.alpha3}`);

  // Placeholder / non-ISO codes
  if (c.iso.alpha2 === 'XX' || c.iso.alpha3 === 'XXX') {
    fail(`${c.id}: placeholder ISO codes XX/XXX are not allowed`);
  }

  if (alpha2.has(c.iso.alpha2)) {
    fail(`Duplicate iso.alpha2 ${c.iso.alpha2}: ${alpha2.get(c.iso.alpha2)} and ${c.id}`);
  } else {
    alpha2.set(c.iso.alpha2, c.id);
  }

  if (alpha3.has(c.iso.alpha3)) {
    fail(`Duplicate iso.alpha3 ${c.iso.alpha3}: ${alpha3.get(c.iso.alpha3)} and ${c.id}`);
  } else {
    alpha3.set(c.iso.alpha3, c.id);
  }
}

if (errors === 0) ok('ISO codes are unique and well-formed');

// --- Index consistency ---
if (index?.coverage?.totalCountries != null) {
  if (index.coverage.totalCountries !== countries.length) {
    fail(
      `index.json coverage.totalCountries (${index.coverage.totalCountries}) !== countries.json length (${countries.length})`
    );
  } else {
    ok('index.json country count matches countries.json');
  }
}

// --- Soft quality signals ---
const withInfo = countries.filter((c) => c.info && Object.keys(c.info).length > 0).length;
const active = countries.filter((c) => c.status === 'active').length;
if (withInfo === 0) {
  warn('No countries have non-empty info{} — content enrichment still needed');
}
ok(`Status: ${active} active, ${countries.length - active} other; info filled: ${withInfo}`);

// --- Summary ---
console.log('');
if (errors > 0) {
  console.error(`Validation failed: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
}
console.log(`Validation passed with ${warnings} warning(s)`);
process.exit(0);
