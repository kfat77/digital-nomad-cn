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
  './meme.html',
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
  'docs/meme.html',
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
  if (html.includes('重大事项')) fail(`${file} still uses the old calendar module name`);
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
if (hubCards.length !== 7) fail(`Homepage must expose 7 module hub cards (found ${hubCards.length})`);
if (homepage.includes('module-card tool-card')) fail('Homepage still stacks the legacy tool cards');
if (homepage.includes('id="roadmap"') || homepage.includes('roadmap-node')) {
  fail('The removed roadmap module is still present on the homepage');
}
if (!hubCards.every((card) => card.includes('hub-card'))) fail('Hub cards must use the shared hub-card class');
for (const target of ['./banking.html', './phone.html', './securities.html', './ai-subscriptions.html', './calendar.html', './legal.html', './meme.html']) {
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

// 钱进日历 must be a month-grid board driven by local JSON, with both past and future dates.
const calendarPage = sources.get('docs/calendar.html');
if (!calendarPage.includes('js/calendar.js')) fail('Calendar page does not load its renderer');
for (const marker of ['data-calendar-grid', 'data-calendar-month', 'data-calendar-filters',
  'data-calendar-watchlist', 'data-calendar-legend', 'data-calendar-today']) {
  if (!calendarPage.includes(marker)) fail(`Calendar page is missing ${marker}`);
}
if (/class="calendar-item/.test(calendarPage)) fail('Calendar page must not fall back to the old list layout');
if (!calendarPage.includes('钱进日历')) fail('Calendar page must carry its renamed title');

const calendarScript = await readFile(resolve('docs/js/calendar.js'), 'utf8');
for (const marker of ['cal-cell', 'renderMonth', 'pop-up', 'data-calendar-grid']) {
  if (!calendarScript.includes(marker)) fail(`Calendar renderer is missing ${marker}`);
}
if (calendarScript.includes('calendar-item')) fail('Calendar renderer still builds the removed list items');

const calendarData = JSON.parse(await readFile(resolve('docs/data/calendar.json'), 'utf8'));
const events = Array.isArray(calendarData.items) ? calendarData.items : [];
if (events.length < 60) fail(`Calendar data looks too thin (${events.length} events)`);
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
// The schedule must run well past the publication year, not just list past events.
const dates = events.map((event) => event.date).sort();
if (dates[0] > '2026-01-31') fail(`Calendar starts too late: ${dates[0]}`);
if (dates[dates.length - 1] < '2027-12-01') {
  fail(`Calendar must carry the confirmed next-year schedule (ends ${dates[dates.length - 1]})`);
}
const futureCount = events.filter((event) => event.date > '2026-12-31').length;
if (futureCount < 40) fail(`Calendar needs a full next-year schedule (found ${futureCount} items)`);

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

// Forum accounts are derived from the network address: no login, no sign-up, rename only.
for (const marker of ['data-account-card', 'data-account-form', 'data-account-name', 'data-account-status', 'data-post-as']) {
  if (!forumPage.includes(marker)) fail(`Community forum page is missing the address-based account marker ${marker}`);
}
if (!forumScript.includes('forum_whoami')) fail('Forum must resolve the caller identity from the network address');
if (!forumScript.includes('set_forum_name')) fail('Forum must let each visitor rename their own account');
if (forumScript.includes('signUp') || forumScript.includes('signInWithPassword')) {
  fail('Forum must not offer sign-up or password sign-in');
}
if (/type=("|')password\1/.test(forumPage)) fail('Forum must not render a password field');
if (!forumPage.includes('data-account-note') || !forumPage.includes('登录')) {
  fail('Forum account band must explain that no login is required');
}

// Meme 雷达：多链候选扫描，只做证据展示，不连接钱包、不下单。
const memePage = sources.get('docs/meme.html');
for (const marker of ['js/meme.js', 'data-radar-list', 'data-radar-status', 'data-radar-source',
  'data-radar-scanned', 'data-radar-updated', 'data-radar-depth', 'data-radar-refresh',
  'data-radar-auto', 'data-radar-cross', 'data-radar-filters']) {
  if (!memePage.includes(marker)) fail(`Meme radar page is missing ${marker}`);
}
for (const chain of ['solana', 'bsc', 'base', 'eth']) {
  if (!memePage.includes(`data-chain="${chain}"`)) fail(`Meme radar page is missing the ${chain} scan target`);
}
for (const filter of ['all', 'pass', 'review', 'veto', 'unknown']) {
  if (!memePage.includes(`data-filter="${filter}"`)) fail(`Meme radar page is missing the ${filter} filter`);
}
// 任何买卖判断都必须带固定免责声明，且「未核验」的读法必须写在页面上。
if (!memePage.includes('不构成投资建议。市场有风险，投资需谨慎。') || !memePage.includes('过往表现不预示未来收益。')) {
  fail('Meme radar page must carry the fixed investment disclaimer');
}
if (!memePage.includes('未核验')) fail('Meme radar page must explain the unverified state');

const memeScript = await readFile(resolve('docs/js/meme.js'), 'utf8');
if (!memeScript.includes('escapeHtml')) fail('Meme radar must escape every upstream field before rendering');
if (memeScript.includes('IntersectionObserver')) fail('Meme radar must not rely on IntersectionObserver');
if (!memeScript.includes('geckoterminal.com/api/v2')) fail('Meme radar lost its market data source');
if (!memeScript.includes('gopluslabs.io')) fail('Meme radar lost its contract risk source');
// GMGN 在国内被 DNS 污染，不能作为主链路或复核入口。
if (/gmgn/i.test(memeScript)) fail('Meme radar must not depend on GMGN, which is unreachable from the target audience');
if (/signTransaction|sendTransaction|privateKey|seedPhrase|ethereum\.request/i.test(memeScript)) {
  fail('Meme radar must never touch wallets or transactions');
}
// 未取到的字段必须留空并标未核验，不能兜底成通过或塞演示数据。
if (!memeScript.includes("'unknown'")) fail('Meme radar must keep a distinct unverified state');
if (/(mockData|DEMO_POOLS|sampleData\s*=|fakePools)/.test(memeScript)) {
  fail('Meme radar must not fall back to demo data');
}

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
for (const required of ['.hub-grid', '.hub-card', '.cal-cell', '.cal-pop', '.forum-stats', '.topic-toggle', '.account-card', '.account-form-row', '.card-radar', '.radar-card', '.radar-check', '.radar-metrics dd.is-up', '.nav-dropdown-menu']) {
  if (!styles.includes(required)) fail(`Shared stylesheet is missing ${required}`);
}

// Sitemap must list every page.
const sitemap = await readFile(resolve('docs/sitemap.xml'), 'utf8');
for (const file of PAGES) {
  const slug = file.replace('docs/', '').replace('index.html', '');
  if (!sitemap.includes(`/digital-nomad-cn/${slug}`)) fail(`Sitemap is missing ${file}`);
}

console.log(`Checked ${PAGES.length} pages, shared navigation, calendar data, forum script, meme radar and stylesheet.`);
