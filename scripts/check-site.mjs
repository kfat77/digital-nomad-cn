import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const pages = [
  ['docs/index.html', '出海前，先把'],
  ['docs/legal.html', '最新跨境法律法规'],
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
if (homepage.includes('hero-actions') || !homepage.includes('id="random-quote"')) {
  throw new Error('Hero quote widget has not replaced the legacy action group');
}
const tools = homepage.match(/class="module-card tool-card/g) ?? [];
const externalLinks = homepage.match(/target="_blank"/g) ?? [];
if (tools.length !== 22 || externalLinks.length < 16 || !homepage.includes('id="ai-subscriptions"')) {
  throw new Error('Tool directory must contain 22 cards, including the link-free AI subscription cards');
}

const styles = await readFile(resolve('docs/styles.css'), 'utf8');
for (const legacySelector of ['[data-reveal]', '.is-visible', 'hero-enter']) {
  if (styles.includes(legacySelector)) throw new Error(`Legacy CSS animation selector remains: ${legacySelector}`);
}
if (!app.includes("fetch('./data/quotes.json')") || !app.includes('Math.random() * quotes.length')) {
  throw new Error('Random quote functionality is missing');
}
const legalPage = await readFile(resolve('docs/legal.html'), 'utf8');
const legalCards = legalPage.match(/class="module-card tool-card card-securities legal-card"/g) ?? [];
if (legalCards.length !== 10 || (legalPage.match(/官网直达 ↗/g) ?? []).length !== 10) {
  throw new Error('Legal page must contain 10 official-link cards');
}
if (!legalPage.includes('vanilla-tilt') || !legalPage.includes('ScrollTrigger.min.js') || legalPage.includes('<img')) {
  throw new Error('Legal page animation resources or pure-text title rules are invalid');
}
console.log(`Checked ${pages.length} pages and shared navigation.`);
