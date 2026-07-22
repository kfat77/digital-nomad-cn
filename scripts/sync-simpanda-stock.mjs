const sourceUrl = 'https://simpanda.cc/api/v1/public/products/Giffgaff';
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const sourceResponse = await fetch(sourceUrl, { headers: { Accept: 'application/json' } });
if (!sourceResponse.ok) throw new Error(`Supplier request failed: ${sourceResponse.status}`);

const source = await sourceResponse.json();
const stock = Number(source?.data?.manual_stock_available);
if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
  throw new Error(`Supplier returned an invalid stock value: ${source?.data?.manual_stock_available}`);
}

if (process.env.DRY_RUN === 'true') {
  console.log(`Validated Simpanda Giffgaff stock: ${stock}`);
  process.exit(0);
}

const updateResponse = await fetch(`${supabaseUrl}/rest/v1/product_settings?key=eq.card_stock`, {
  method: 'PATCH',
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify({ value: String(stock), updated_at: new Date().toISOString() }),
});

if (!updateResponse.ok) throw new Error(`Supabase update failed: ${updateResponse.status} ${await updateResponse.text()}`);
const updated = await updateResponse.json();
if (!Array.isArray(updated) || updated.length !== 1) throw new Error('Expected exactly one inventory record to be updated.');

console.log(`Updated card_stock to ${stock}.`);
