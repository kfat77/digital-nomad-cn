# Scripts

Automation for data validation and GitHub Pages (`docs/`) derived assets.

| Script | Purpose |
|--------|---------|
| `validate-data.js` | Schema + ISO uniqueness + index consistency |
| `update-dataset-stats.js` | Regenerate `datasets/index.json` coverage and `_stats.json` |
| `generate-countries-data.js` | `datasets/countries.json` → `docs/countries-data.js` |
| `sync-to-docs.js` | Run generate + stats (deploy-root sync) |
| `bump-sw-cache.js` | Bump `docs/sw.js` `CACHE_VERSION` |
| `generate-sitemap.js` | Scan `docs/**/*.html` → `docs/sitemap.xml` |

## Common commands

```bash
npm run validate
npm run sync:data
npm run sync:docs
npm run bump:sw
npm test
```

**Deploy root:** `docs/` (GitHub Pages). Do not reintroduce a required `website/` tree.
