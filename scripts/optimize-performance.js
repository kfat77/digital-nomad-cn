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

// ============================================
// 1. Optimize Google Fonts loading
// ============================================
function optimizeFonts(content) {
  // Replace blocking Google Fonts with non-blocking pattern
  // Old: <link href="https://fonts.googleapis.com/css2?family=Inter...&display=swap" rel="stylesheet">
  // New: media="print" onload pattern
  const fontRegex = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet">/;
  
  if (fontRegex.test(content)) {
    const match = content.match(fontRegex);
    if (match) {
      const fontUrl = match[0].match(/href="([^"]+)"/)[1];
      const replacement = `<link rel="preload" href="${fontUrl}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${fontUrl}"></noscript>`;
      content = content.replace(match[0], replacement);
    }
  }
  return content;
}

// ============================================
// 2. Add dns-prefetch and additional preconnect
// ============================================
function addResourceHints(content) {
  const hints = [
    '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">',
    '<link rel="dns-prefetch" href="https://fonts.googleapis.com">',
    '<link rel="dns-prefetch" href="https://fonts.gstatic.com">',
    '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>',
  ];

  // Check if already has dns-prefetch
  if (content.includes('dns-prefetch')) return content;

  // Insert after the last preconnect
  const lastPreconnect = content.match(/<link rel="preconnect"[^>]*>/g);
  if (lastPreconnect) {
    const lastMatch = lastPreconnect[lastPreconnect.length - 1];
    const idx = content.indexOf(lastMatch) + lastMatch.length;
    return content.slice(0, idx) + '\n    ' + hints.join('\n    ') + content.slice(idx);
  }

  // Insert after theme-color meta
  const themeColor = content.match(/<meta name="theme-color"[^>]*>/);
  if (themeColor) {
    const idx = content.indexOf(themeColor[0]) + themeColor[0].length;
    return content.slice(0, idx) + '\n    ' + hints.join('\n    ') + content.slice(idx);
  }

  return content;
}

// ============================================
// 3. Lower Three.js priority (non-critical)
// ============================================
function optimizeThreeJs(content) {
  // Add fetchpriority="low" to Three.js script
  return content.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/three@[^"]+" defer><\/script>/,
    '<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js" defer fetchpriority="low"></script>'
  );
}

// ============================================
// 4. Defer non-critical inline scripts
// ============================================
function deferGitHubStars(content) {
  // Wrap GitHub stars fetch in requestIdleCallback or setTimeout
  return content.replace(
    /(<script>\s*\/\/ Fetch GitHub star count[\s\S]*?<\/script>)/,
    `<script>
        // Fetch GitHub star count (deferred to idle time)
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                fetch('https://api.github.com/repos/kfat77/digital-nomad-cn')
                    .then(r => r.json())
                    .then(data => {
                        const stars = data.stargazers_count;
                        if (stars !== undefined) {
                            const el = document.getElementById('github-stars');
                            if (el) el.textContent = '⭐ ' + stars;
                        }
                    })
                    .catch(() => {});
            }, { timeout: 5000 });
        } else {
            setTimeout(() => {
                fetch('https://api.github.com/repos/kfat77/digital-nomad-cn')
                    .then(r => r.json())
                    .then(data => {
                        const stars = data.stargazers_count;
                        if (stars !== undefined) {
                            const el = document.getElementById('github-stars');
                            if (el) el.textContent = '⭐ ' + stars;
                        }
                    })
                    .catch(() => {});
            }, 2000);
        }
    </script>`
  );
}

// ============================================
// 5. Add resource hints to country detail pages
// ============================================
function addCountryPageHints(content, filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  
  // If this is a country page, preload world-geo.json
  if (rel.includes('country/') && rel.endsWith('index.html')) {
    if (!content.includes('world-geo.json')) {
      const preload = '<link rel="preload" href="../../world-geo.json" as="fetch" crossorigin type="application/json">';
      const headEnd = content.indexOf('</head>');
      if (headEnd > 0) {
        return content.slice(0, headEnd) + '    ' + preload + '\n' + content.slice(headEnd);
      }
    }
  }
  
  return content;
}

// ============================================
// Main
// ============================================
function main() {
  const allFiles = getAllHtmlFiles(ROOT);
  let modified = 0;

  for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;

    // Apply optimizations
    content = optimizeFonts(content);
    content = addResourceHints(content);
    content = optimizeThreeJs(content);
    content = deferGitHubStars(content);
    content = addCountryPageHints(content, file);

    if (content !== original) {
      fs.writeFileSync(file, content);
      modified++;
    }
  }

  console.log(`Optimized ${modified} HTML files`);

  // Sync to docs/
  const syncScript = path.resolve(__dirname, 'sync-to-docs.js');
  if (fs.existsSync(syncScript)) {
    require(syncScript);
    console.log('Synced to docs/');
  }
}

main();
