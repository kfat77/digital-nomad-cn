const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const products = [
  { slug: 'Giffgaff', sourceField: 'manual_stock_available', settingKey: 'card_stock', label: 'Giffgaff 电话卡' },
  { slug: 'czk', sourceField: 'auto_stock_available', settingKey: 'recharge_stock', label: 'Giffgaff 10 英镑充值券' },
];

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const inventories = await Promise.all(products.map(async (product) => {
  const response = await fetch(`https://simpanda.cc/api/v1/public/products/${product.slug}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${product.label} supplier request failed: ${response.status}`);
  const source = await response.json();
  const stock = Number(source?.data?.[product.sourceField]);
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
    throw new Error(`${product.label} returned an invalid stock value: ${source?.data?.[product.sourceField]}`);
  }
  return { ...product, stock };
}));

if (process.env.DRY_RUN === 'true') {
  inventories.forEach(({ label, stock }) => console.log(`Validated ${label} stock: ${stock}`));
  process.exit(0);
}

await Promise.all(inventories.map(async ({ settingKey, stock, label }) => {
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/product_settings?key=eq.${settingKey}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ value: String(stock), updated_at: new Date().toISOString() }),
  });
  if (!updateResponse.ok) throw new Error(`${label} update failed: ${updateResponse.status} ${await updateResponse.text()}`);
  const updated = await updateResponse.json();
  if (!Array.isArray(updated) || updated.length !== 1) throw new Error(`${label} did not update exactly one inventory record.`);
  console.log(`Updated ${settingKey} to ${stock}.`);
}));
