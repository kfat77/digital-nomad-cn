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
if (!app.includes('gsap.registerPlugin(ScrollTrigger)')) throw new Error('GSAP ScrollTrigger setup is missing');
if (app.includes('IntersectionObserver')) throw new Error('Legacy IntersectionObserver animation remains');

const homepage = await readFile(resolve('docs/index.html'), 'utf8');
if (!homepage.includes('gsap@3/dist/gsap.min.js') || !homepage.includes('ScrollTrigger.min.js')) {
  throw new Error('GSAP CDN scripts are missing from the homepage');
}
console.log(`Checked ${pages.length} pages and shared navigation.`);
