# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] — 2026-07-07

### Added
- **M11 — Open Data Release**: CITATION.cff, datapackage.json, expanded datasets/README.md
  - Academic citation support (BibTeX)
  - Frictionless Data standard compliance
  - JS/Python/R usage examples
- **M13 — MCP Server v1.0**: `@digital-nomad-cn/mcp` package with 6 AI Agent tools
  - `nomad_search_countries` — keyword/region/status search
  - `nomad_get_country` — detailed country lookup by ID
  - `nomad_list_regions` — geographic coverage overview
  - `nomad_compare_countries` — side-by-side comparison
  - `nomad_recommend` — preference-based recommendations
  - `nomad_get_stats` — dataset statistics and quality metrics
  - Claude Desktop / Cursor / Windsurf configuration guides
- **100 Countries**: Dataset expanded from 61 to 100 countries across 15 regions
- **REST API v1 + GraphQL API v1**: Cloudflare Workers deployment
- **JS SDK**: `@digital-nomad-cn/sdk` TypeScript client

### Changed
- README: Added MCP Server section, npm badge, Open Data badges, updated roadmap

## [1.2.0] — 2026-07-08

### Added
- **Country Deep-Dive v1.0**: 12 new data fields across all 60 countries
  - healthcare_quality, english_proficiency, monthly_rent_usd_low/high
  - food_cost_usd_daily, transport_cost_usd_monthly, coworking_spaces_count
  - local_tax_rate, pros, cons, ideal_for, best_neighborhoods
- **5 Pilot Country Deep-Dive Pages**: Enhanced pages with cost breakdown, pros/cons, ideal audience, and neighborhood recommendations for Portugal, Thailand, Georgia, Spain, UAE
- **Enhanced API Documentation**: Interactive code tabs (JavaScript/Python/cURL), version changelog, LLM context endpoint card
- **English API Documentation**: Full internationalization of the API docs page
- **Social Sharing**: share.js module with X/Twitter, LinkedIn, copy link, and native Web Share API
- **Mobile Navigation**: Hamburger menu for screens < 900px with responsive nav overlay
- **Custom 404 Page**: Branded 404 with navigation suggestions and recommended content cards
- **Breadcrumb Schema.org**: BreadcrumbList JSON-LD on 5 pilot country pages (CN + EN)
- **Core Web Vitals Monitoring**: PerformanceObserver tracking LCP, CLS, FID via inline script
- **Privacy-First Analytics**: analytics.js with configurable backends (GoatCounter, Plausible, custom), DNT respect, local journey tracking
- **Privacy Policy & Your Journey Pages**: Full transparency on data usage, local-only browsing stats dashboard
- **Community Page**: GitHub Star CTA, 4 contribution entry points, project stats, dual license explanation
- **AI Search Readiness**: llms.txt, robots.txt with AI crawler directives, FAQPage Schema.org on both homepages
- **Dark Mode**: System preference detection + manual toggle + localStorage persistence
- **Print Styles**: Article-optimized print CSS with hidden navigation
- **Reading Progress Bar**: Scroll depth indicator on article pages

### Enhanced
- **API v1.2**: Countries JSON now includes 25+ fields (up from 15)
- **CDN Performance**: dns-prefetch + preconnect for cdn.jsdelivr.net across 120 country pages
- **Resource Loading**: fetchpriority="high" on CSS, defer on non-critical JS (Three.js, app.js, analytics.js)
- **Font Loading**: preconnect for fonts.gstatic.com
- **README**: Updated data counts, new feature sections, value proposition, roadmap milestones
- **CONTRIBUTING.md**: v1.2 field documentation, first-time contributor checklist
- **PR Template**: Added sitemap, sw.js, sync-to-docs checklist items

## [1.1.0] — 2026-07-05

### Added
- **Data Enrichment**: New country fields: climate_zone, timezone, dn_community_size, median_stay_months
- **City Data Enhancement**: remote_work_friendly_score, monthly_cost_usd_low, monthly_cost_usd_high
- **JSON Schema Validation**: `scripts/validate-data.js` for type checking, required fields, enums, ranges
- **Data Quality**: Normalized 60 enum value inconsistencies across countries and cities

## [1.0.0] — 2026-07-01

### Added
- **Initial Release**: 60 countries, 122 cities, visa policies
- **Core Data**: digital_nomad_score, cost_of_living_index, safety_index, internet_speed_avg_mbps
- **Bilingual Site**: Chinese and English versions with hreflang tags
- **Interactive Tools**: Country comparison, route planner, recommendation engine, search
- **3D Globe**: Three.js interactive earth with country markers
- **PWA Support**: Service Worker, manifest.json, offline caching
- **AI Assistant**: Gemini-powered visa consultation
- **Automated Data Updates**: Monthly exchange rate fetching via GitHub Actions
- **Open Data API**: 5 static JSON endpoints (countries, cities, visas, stats, manifest)
- **3 Thematic Articles**: Seasonal guide, cost analysis, visa comparison
- **SEO Foundation**: Sitemap, Open Graph tags, canonical URLs, Schema.org Article markup

[Unreleased]: https://github.com/kfat77/digital-nomad-cn/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/kfat77/digital-nomad-cn/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/kfat77/digital-nomad-cn/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kfat77/digital-nomad-cn/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kfat77/digital-nomad-cn/releases/tag/v1.0.0
