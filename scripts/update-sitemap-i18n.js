const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kfat77.github.io/digital-nomad-cn';
const SITEMAP_PATH = path.resolve(__dirname, '../website/sitemap.xml');
const DOCS_SITEMAP_PATH = path.resolve(__dirname, '../docs/sitemap.xml');

// URL pairs: Chinese -> English mapping
const URL_PAIRS = {
  '/': '/en/',
  '/country/': '/en/countries/',
  '/visa/': '/en/visas/',
  '/city/': '/en/cities/',
  '/compare/': '/en/compare/',
  '/routes/': '/en/routes/',
  '/search/': '/en/search/',
  '/recommend/': '/en/recommend/',
  '/assistant/': '/en/assistant/',
  '/faq/': '/en/faq/',
  '/articles/': '/en/articles/',
};

// Country pages (zh -> en)
const countryIds = fs.readdirSync(path.resolve(__dirname, '../website/country'))
  .filter(d => fs.statSync(path.resolve(__dirname, '../website/country', d)).isDirectory());
for (const id of countryIds) {
  URL_PAIRS[`/country/${id}/`] = `/en/country/${id}/`;
}

// City pages (zh -> en)
const cityFiles = fs.readdirSync(path.resolve(__dirname, '../website/city'))
  .filter(f => f.endsWith('.html'));
for (const f of cityFiles) {
  const slug = f.replace('.html', '');
  URL_PAIRS[`/city/${f}`] = `/en/city/${f}`;
}

// Article pages (zh -> en)
const articleDirs = fs.readdirSync(path.resolve(__dirname, '../website/articles'))
  .filter(d => {
    const p = path.resolve(__dirname, '../website/articles', d);
    return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'index.html'));
  });
for (const slug of articleDirs) {
  URL_PAIRS[`/articles/${slug}/`] = `/en/articles/${slug}/`;
}

// Compare pages
const compareTypes = ['country', 'city'];
for (const type of compareTypes) {
  const compareDir = path.resolve(__dirname, '../website/compare', type);
  if (fs.existsSync(compareDir)) {
    const files = fs.readdirSync(compareDir).filter(f => f.endsWith('.html'));
    for (const f of files) {
      URL_PAIRS[`/compare/${type}/${f}`] = `/en/compare/${type}/${f}`;
    }
  }
}

function getAlternateLinks(zhPath) {
  const enPath = URL_PAIRS[zhPath];
  if (!enPath) return '';
  return `
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${BASE_URL}${zhPath}" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${enPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${zhPath}" />`;
}

function getAlternateLinksForEn(enPath) {
  const zhPath = Object.entries(URL_PAIRS).find(([, v]) => v === enPath)?.[0];
  if (!zhPath) return '';
  return `
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${enPath}" />
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${BASE_URL}${zhPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${zhPath}" />`;
}

// Read existing sitemap
let content = fs.readFileSync(SITEMAP_PATH, 'utf-8');

// Update namespace
content = content.replace(
  /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/,
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
);

// Parse URLs and add alternates
const urlRegex = /<url>([\s\S]*?)<\/url>/g;
const locRegex = /<loc>(.*?)<\/loc>/;

let updatedContent = content.replace(urlRegex, (match) => {
  const locMatch = match.match(locRegex);
  if (!locMatch) return match;
  
  const url = locMatch[1];
  const urlPath = url.replace(BASE_URL, '');
  
  let alternates = '';
  if (urlPath.startsWith('/en/')) {
    alternates = getAlternateLinksForEn(urlPath);
  } else {
    alternates = getAlternateLinks(urlPath);
  }
  
  if (alternates) {
    // Insert alternates before </url>
    return match.replace('</url>', alternates + '\n  </url>');
  }
  
  return match;
});

// Update lastmod date
const today = new Date().toISOString().split('T')[0];
updatedContent = updatedContent.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

// Write updated sitemap
fs.writeFileSync(SITEMAP_PATH, updatedContent);
fs.writeFileSync(DOCS_SITEMAP_PATH, updatedContent);

// Count alternates added
const altCount = (updatedContent.match(/xhtml:link/g) || []).length / 3;
console.log(`Updated sitemap.xml with ${altCount} multilingual URL entries`);
console.log(`Files written: ${SITEMAP_PATH}, ${DOCS_SITEMAP_PATH}`);
