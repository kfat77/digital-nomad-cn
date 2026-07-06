#!/usr/bin/env node
/**
 * Auto-generate sitemap.xml from website/ directory
 * Scans all HTML files and generates sitemap with hreflang alternates
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kfat77.github.io/digital-nomad-cn';
const WEBSITE_DIR = path.join(__dirname, '..', 'website');

function walk(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(base, entry.name);
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath, relative));
    } else if (entry.name.endsWith('.html')) {
      files.push(relative.replace(/\\/g, '/'));
    }
  }
  return files;
}

function getAlternates(relPath) {
  const alternates = [];
  const hasEn = relPath.startsWith('en/');
  const zhPath = hasEn ? relPath.replace(/^en\//, '') : relPath;
  const enPath = hasEn ? relPath : 'en/' + relPath;

  // Always add zh-CN
  alternates.push({ lang: 'zh-CN', url: `${BASE_URL}/${zhPath.replace(/index\.html$/, '')}` });

  // Check if English version exists
  const enFullPath = path.join(WEBSITE_DIR, enPath);
  if (fs.existsSync(enFullPath)) {
    alternates.push({ lang: 'en', url: `${BASE_URL}/${enPath.replace(/index\.html$/, '')}` });
  }

  // x-default points to zh-CN version
  alternates.push({ lang: 'x-default', url: `${BASE_URL}/${zhPath.replace(/index\.html$/, '')}` });

  return alternates;
}

function generateSitemap() {
  const files = walk(WEBSITE_DIR);
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // Deduplicate by stripping en/ prefix for zh entries
  const seen = new Set();
  const zhFiles = files.filter(f => {
    if (f.startsWith('en/')) return false;
    const key = f.replace(/index\.html$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const file of zhFiles.sort()) {
    const urlPath = file.replace(/index\.html$/, '');
    const fullUrl = `${BASE_URL}/${urlPath}`;
    const alternates = getAlternates(file);

    xml += '  <url>\n';
    xml += `    <loc>${fullUrl}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;

    for (const alt of alternates) {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}" />\n`;
    }

    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  const sitemapPath = path.join(WEBSITE_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');

  // Also update docs/
  const docsPath = path.join(__dirname, '..', 'docs', 'sitemap.xml');
  if (fs.existsSync(path.dirname(docsPath))) {
    fs.writeFileSync(docsPath, xml, 'utf8');
  }

  const urlCount = zhFiles.length;
  console.log(`✅ Sitemap generated: ${urlCount} URLs`);
  console.log(`   website/sitemap.xml`);
  console.log(`   docs/sitemap.xml`);
}

generateSitemap();
