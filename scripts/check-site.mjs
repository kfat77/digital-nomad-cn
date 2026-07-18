import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const pages = [
  ['docs/index.html', '出海前，先把<br>三件事办好。'],
  ['docs/banking/index.html', '银行卡'],
  ['docs/phone/index.html', '电话卡'],
  ['docs/securities/index.html', '证券账户'],
];

for (const [file, expectedText] of pages) {
  const html = await readFile(resolve(file), 'utf8');
  if (!html.includes(expectedText)) throw new Error(`${file} is missing its page heading`);
  if (!html.includes('styles.css')) throw new Error(`${file} does not load the shared stylesheet`);
}

const app = await readFile(resolve('docs/app.js'), 'utf8');
if (!app.includes('data-menu-toggle')) throw new Error('Shared navigation behavior is missing');
console.log(`Checked ${pages.length} pages and shared navigation.`);
