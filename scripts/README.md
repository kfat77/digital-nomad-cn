# Scripts

Small, dependency-free utilities for validating and maintaining the GitHub Pages site in `docs/`.

| Script | Purpose |
|--------|---------|
| `check-site.mjs` | Validate page structure, navigation, content and animation dependencies |
| `bump-sw-cache.js` | Bump `docs/sw.js` `CACHE_VERSION` |
| `generate-sitemap.js` | Scan `docs/**/*.html` → `docs/sitemap.xml` |

## Common commands

```bash
npm run check
npm run sitemap
npm run bump:sw
```

**Deploy root:** `docs/` (GitHub Pages). Keep generated site output and source pages under this single tree.
