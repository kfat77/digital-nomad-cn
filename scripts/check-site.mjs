import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const NAV = [
  './index.html',
  './banking.html',
  './phone.html',
  './securities.html',
  './calendar.html',
  './community.html',
  './ai-subscriptions.html',
  './legal.html',
];

const PAGES = [
  'docs/index.html',
  'docs/banking.html',
  'docs/phone.html',
  'docs/securities.html',
  'docs/ai-subscriptions.html',
  'docs/calendar.html',
  'docs/community.html',
  'docs/legal.html',
];

const fail = (message) => {
  throw new Error(message);
};

const sources = new Map();
for (const file of PAGES) {
  sources.set(file, await readFile(resolve(file), 'utf8'));
}

for (const file of PAGES) {
  const html = sources.get(file);
  if (!html.includes('styles.css')) fail(`${file} does not load the shared stylesheet`);
  if (!/lang="zh-CN"/.test(html)) fail(`${file} is missing lang="zh-CN"`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${file} is missing a document title`);
  if (!html.includes('name="description"')) fail(`${file} is missing a meta description`);
  if (!html.includes('app.js')) fail(`${file} does not load the shared app.js`);
  if (!html.includes('data-menu-toggle')) fail(`${file} is missing the shared menu toggle`);
  const current = (html.match(/aria-current="page"/g) ?? []).length;
  if (current !== 1) fail(`${file} must mark exactly one current navigation item (found ${current})`);
  if (!html.includes('class="site-nav"')) fail(`${file} is missing the shared site navigation`);
}

for (const file of PAGES) {
  const html = sources.get(file);
  for (const href of NAV) {
    // The homepage brand links to "./" and every page links to itself at least once.
    if (!html.includes(`href="${href}"`)) fail(`${file} is missing the navigation link ${href}`);
  }
}

// Homepage is a module hub: no stacked tool cards, no leftover roadmap section.
const homepage = sources.get('docs/index.html');
const hubCards = homepage.match(/class="hub-card[^"]*"/g) ?? [];
if (hubCards.length !== 6) fail(`Homepage must expose 6 module hub cards (found ${hubCards.length})`);
if (homepage.includes('module-card tool-card')) fail('Homepage still stacks the legacy tool cards');
if (homepage.includes('id="roadmap"') || homepage.includes('roadmap-node')) {
  fail('The removed roadmap module is still present on the homepage');
}
if (!hubCards.every((card) => card.includes('hub-card'))) fail('Hub cards must use the shared hub-card class');
for (const target of ['./banking.html', './phone.html', './securities.html', './ai-subscriptions.html', './calendar.html', './legal.html']) {
  if (!homepage.includes(`href="${target}"`)) fail(`Homepage hub is missing an entry for ${target}`);
}
if (!homepage.includes('gsap@3/dist/gsap.min.js') || !homepage.includes('ScrollTrigger.min.js')) {
  fail('GSAP CDN scripts are missing from the homepage');
}
if (homepage.includes('hero-actions') || !homepage.includes('id="random-quote"')) {
  fail('Hero quote widget has not replaced the legacy action group');
}

// Each module page owns its own card list.
const MODULES = [
  ['docs/banking.html', 9, '银行卡'],
  ['docs/phone.html', 4, '电话卡'],
  ['docs/securities.html', 4, '海外证券'],
  ['docs/ai-subscriptions.html', 5, 'AI 订阅'],
];
for (const [file, expected, label] of MODULES) {
  const html = sources.get(file);
  const cards = html.match(/class="module-card tool-card/g) ?? [];
  if (cards.length !== expected) {
    fail(`${file} must contain ${expected} ${label} entries (found ${cards.length})`);
  }
  if (!html.includes('section-wrap')) fail(`${file} must use the shared section layout`);
}

// Calendar page renders from local JSON only, and keeps past events collapsed.
const calendarPage = sources.get('docs/calendar.html');
if (!calendarPage.includes('js/calendar.js')) fail('Calendar page does not load its renderer');
if (!calendarPage.includes('data-calendar-list') || !calendarPage.includes('data-calendar-watchlist')) {
  fail('Calendar page is missing its list containers');
}
const calendarData = JSON.parse(await readFile(resolve('docs/data/calendar.json'), 'utf8'));
const events = Array.isArray(calendarData.items) ? calendarData.items : [];
if (events.length < 20) fail(`Calendar data looks too thin (${events.length} events)`);
for (const event of events) {
  for (const key of ['date', 'title', 'category', 'region', 'detail', 'impact']) {
    if (!event[key]) fail(`Calendar event is missing "${key}": ${JSON.stringify(event).slice(0, 80)}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) fail(`Calendar event has a malformed date: ${event.date}`);
  const known = (calendarData.categories ?? []).some((item) => item.key === event.category);
  if (!known) fail(`Calendar event uses an unknown category: ${event.category}`);
}
if (!Array.isArray(calendarData.watchlist) || calendarData.watchlist.length < 3) {
  fail('Calendar watchlist must describe the undated risk items');
}

// Forum page keeps its publishing flow plus the new browsing tools.
const forumPage = sources.get('docs/community.html');
for (const marker of ['data-topic-form', 'js/forum.js', 'data-forum-search', 'data-stat-topics', 'data-sort', 'data-char-count']) {
  if (!forumPage.includes(marker)) fail(`Community forum page is missing ${marker}`);
}
const forumScript = await readFile(resolve('docs/js/forum.js'), 'utf8');
if (!forumScript.includes('escapeHtml')) fail('Forum output must stay escaped');
if (!forumScript.includes('get_forum_topics') || !forumScript.includes('create_forum_topic')) {
  fail('Forum RPC endpoints are missing');
}
if (forumScript.includes('IntersectionObserver')) fail('Forum page must not rely on IntersectionObserver');

// Legal page keeps its 10 official-link cards.
const legalPage = sources.get('docs/legal.html');
const legalCards = legalPage.match(/class="module-card tool-card card-securities legal-card"/g) ?? [];
if (legalCards.length !== 10 || (legalPage.match(/官网直达 ↗/g) ?? []).length !== 10) {
  fail('Legal page must contain 10 official-link cards');
}
if (!legalPage.includes('vanilla-tilt') || !legalPage.includes('ScrollTrigger.min.js') || legalPage.includes('<img')) {
  fail('Legal page animation resources or pure-text title rules are invalid');
}

// Shared behaviour and stylesheet rules.
const app = await readFile(resolve('docs/app.js'), 'utf8');
if (!app.includes('data-menu-toggle')) fail('Shared navigation behavior is missing');
if (!app.includes('gsap.registerPlugin(ScrollTrigger)')) fail('GSAP ScrollTrigger setup is missing');
if (app.includes('IntersectionObserver')) fail('Legacy IntersectionObserver animation remains');
if (app.includes('roadmap')) fail('Legacy roadmap animation target remains');
if (!app.includes("fetch('./data/quotes.json')") || !app.includes('Math.random() * quotes.length')) {
  fail('Random quote functionality is missing');
}
if (!app.includes("ScrollTrigger.batch('.hub-card'")) fail('Hub cards are not wired into the shared reveal animation');

const styles = await readFile(resolve('docs/styles.css'), 'utf8');
for (const legacySelector of ['[data-reveal]', '.is-visible', 'hero-enter', '.roadmap-']) {
  if (styles.includes(legacySelector)) fail(`Legacy CSS selector remains: ${legacySelector}`);
}
for (const required of ['.hub-grid', '.hub-card', '.calendar-item', '.forum-stats', '.topic-toggle', '.nav-dropdown-menu']) {
  if (!styles.includes(required)) fail(`Shared stylesheet is missing ${required}`);
}

// Sitemap must list every page.
const sitemap = await readFile(resolve('docs/sitemap.xml'), 'utf8');
for (const file of PAGES) {
  const slug = file.replace('docs/', '').replace('index.html', '');
  if (!sitemap.includes(`/digital-nomad-cn/${slug}`)) fail(`Sitemap is missing ${file}`);
}

console.log(`Checked ${PAGES.length} pages, shared navigation, calendar data, forum script and stylesheet.`);
