const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../website');
const DOCS_ROOT = path.resolve(__dirname, '../docs');

function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function removeOldEnglishLink(content) {
  // Remove hardcoded English links with various patterns
  content = content.replace(/<a[^>]*href="en\/"[^>]*>English<\/a>\s*/gi, '');
  content = content.replace(/<a[^>]*href="\.\.\/en\/"[^>]*>English<\/a>\s*/gi, '');
  content = content.replace(/<a[^>]*href="\.\.\/\.\.\/en\/"[^>]*>English<\/a>\s*/gi, '');
  return content;
}

function addLangSwitcherScript(content, relativePath) {
  // Don't add if already present
  if (content.includes('lang-switcher.js')) return content;

  // Calculate relative path to lang-switcher.js
  const depth = relativePath.replace(/\\/g, '/').split('/').length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  const scriptTag = `<script src="${prefix}lang-switcher.js" defer></script>`;

  // Insert before </body>
  if (content.includes('</body>')) {
    return content.replace('</body>', `  ${scriptTag}\n</body>`);
  }
  
  return content;
}

function main() {
  const allFiles = getAllHtmlFiles(ROOT);
  let modified = 0;
  let removedLinks = 0;

  for (const file of allFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;

    // Remove old hardcoded English links
    content = removeOldEnglishLink(content);
    if (content !== original) removedLinks++;

    // Add lang-switcher script
    content = addLangSwitcherScript(content, rel);

    if (content !== original) {
      fs.writeFileSync(file, content);
      modified++;
    }
  }

  console.log(`Modified ${modified} files`);
  console.log(`Removed old English links from ${removedLinks} files`);

  // Copy lang-switcher.js to docs/
  const src = path.join(ROOT, 'lang-switcher.js');
  const dst = path.join(DOCS_ROOT, 'lang-switcher.js');
  fs.copyFileSync(src, dst);
  console.log('Copied lang-switcher.js to docs/');
}

main();
