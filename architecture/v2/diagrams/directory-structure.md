# 目录结构图

## 完整目录树

```
digital-nomad-cn/
│
├── 📁 .github/                          # GitHub配置
│   ├── workflows/
│   │   ├── validate-data.yml           # 数据校验CI
│   │   ├── build-api.yml               # API构建CI
│   │   ├── build-website.yml           # 网站构建CI
│   │   ├── generate-docs.yml           # 文档生成CI
│   │   └── release.yml                 # 发布CI
│   ├── ISSUE_TEMPLATE/
│   │   ├── data-update.md
│   │   ├── new-country.md
│   │   └── bug-report.md
│   ├── PULL_REQUEST_TEMPLATE/
│   │   ├── data-contribution.md
│   │   └── code-contribution.md
│   ├── CODEOWNERS
│   ├── FUNDING.yml
│   └── stale.yml
│
├── 📁 schemas/                          # ⭐ 数据定义（核心资产）
│   ├── README.md
│   ├── _meta/
│   │   ├── schema-version.json
│   │   ├── index.json
│   │   └── changelog.json
│   ├── core/
│   │   ├── country.schema.json         # 18个Schema
│   │   ├── city.schema.json
│   │   └── region.schema.json
│   ├── mobility/
│   │   ├── passport.schema.json
│   │   ├── visa.schema.json
│   │   ├── flight.schema.json
│   │   └── border.schema.json
│   ├── living/
│   │   ├── cost.schema.json
│   │   ├── salary.schema.json
│   │   ├── currency.schema.json
│   │   └── tax.schema.json
│   ├── infrastructure/
│   │   ├── internet.schema.json
│   │   ├── cowork.schema.json
│   │   ├── coliving.schema.json
│   │   ├── bank.schema.json
│   │   └── insurance.schema.json
│   ├── quality/
│   │   ├── safety.schema.json
│   │   ├── healthcare.schema.json
│   │   ├── education.schema.json
│   │   └── weather.schema.json
│   └── derived/
│       ├── ranking.schema.json
│       ├── nomad-score.schema.json
│       └── comparison.schema.json
│
├── 📁 datasets/                         # ⭐ 数据集（核心资产）
│   ├── README.md
│   ├── countries/                       # 按国家组织
│   │   ├── thailand/
│   │   │   ├── country.json
│   │   │   ├── cities/
│   │   │   │   ├── bangkok.json
│   │   │   │   └── chiang-mai.json
│   │   │   ├── visa.json
│   │   │   ├── tax.json
│   │   │   ├── cost.json
│   │   │   ├── internet.json
│   │   │   ├── safety.json
│   │   │   ├── healthcare.json
│   │   │   └── weather.json
│   │   ├── japan/
│   │   └── ... (195+ countries)
│   ├── global/
│   │   ├── passport-index.json
│   │   ├── visa-matrix.json
│   │   └── exchange-rates.json
│   └── index.json
│
├── 📁 api/                              # API服务
│   ├── README.md
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── countries.ts
│   │   │   ├── cities.ts
│   │   │   ├── visa.ts
│   │   │   └── search.ts
│   │   ├── resolvers/
│   │   │   ├── country.ts
│   │   │   └── city.ts
│   │   ├── mcp/
│   │   │   ├── server.ts
│   │   │   └── tools/
│   │   │       ├── search-countries.ts
│   │   │       ├── get-visa.ts
│   │   │       └── compare-costs.ts
│   │   ├── validators/
│   │   │   └── schema-validator.ts
│   │   └── utils/
│   │       ├── cache.ts
│   │       └── i18n.ts
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 packages/                         # SDK包
│   ├── js-sdk/
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── python-sdk/
│   │   ├── digital_nomad_cn/
│   │   │   ├── __init__.py
│   │   │   ├── client.py
│   │   │   └── models.py
│   │   ├── pyproject.toml
│   │   └── README.md
│   └── cli/
│       ├── src/
│       │   ├── commands/
│       │   │   ├── search.ts
│       │   │   ├── validate.ts
│       │   │   ├── build.ts
│       │   │   └── contribute.ts
│       │   └── index.ts
│       ├── package.json
│       └── README.md
│
├── 📁 mcp/                              # MCP Server
│   ├── README.md
│   ├── src/
│   │   ├── server.ts
│   │   ├── tools/
│   │   │   ├── index.ts
│   │   │   ├── search-countries.ts
│   │   │   ├── get-country.ts
│   │   │   ├── search-cities.ts
│   │   │   ├── get-visa.ts
│   │   │   ├── compare-costs.ts
│   │   │   ├── calculate-tax.ts
│   │   │   ├── find-coworking.ts
│   │   │   └── recommend-destinations.ts
│   │   └── utils/
│   │       └── data-loader.ts
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 ai/                               # AI能力
│   ├── README.md
│   ├── embeddings/
│   │   ├── generate.ts
│   │   └── models/
│   │       ├── country-embeddings.json
│   │       └── city-embeddings.json
│   ├── rag/
│   │   ├── query.ts
│   │   └── context-builder.ts
│   ├── semantic-search/
│   │   ├── index.ts
│   │   └── search.ts
│   └── structured-output/
│       ├── destination-recommendation.json
│       ├── visa-guide.json
│       └── cost-comparison.json
│
├── 📁 website/                          # 网站（消费者之一）
│   ├── README.md
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── data/
│   │   └── styles/
│   ├── static/
│   ├── astro.config.mjs
│   └── package.json
│
├── 📁 docs/                             # 文档
│   ├── README.md
│   ├── .vitepress/
│   │   └── config.ts
│   ├── guide/
│   │   ├── getting-started.md
│   │   ├── api-reference.md
│   │   └── sdk-usage.md
│   ├── contributing/
│   │   ├── how-to-contribute.md
│   │   ├── data-guidelines.md
│   │   └── schema-reference.md
│   └── architecture/
│       ├── overview.md
│       ├── data-layer.md
│       └── api-design.md
│
├── 📁 examples/                         # 示例
│   ├── README.md
│   ├── nextjs-nomad-app/
│   ├── react-nomad-dashboard/
│   ├── python-nomad-analysis/
│   ├── mcp-client-example/
│   ├── api-integration/
│   │   ├── nodejs/
│   │   ├── python/
│   │   └── go/
│   └── data-visualization/
│       ├── d3/
│       └── observable/
│
├── 📁 scripts/                          # 自动化脚本
│   ├── README.md
│   ├── validate-data.ts
│   ├── generate-index.ts
│   ├── generate-derived.ts
│   ├── build-website.ts
│   ├── sync-to-docs.ts
│   └── release-dataset.ts
│
├── 📁 tools/                            # 开发者工具
│   ├── README.md
│   ├── schema-to-typescript/
│   ├── schema-to-python/
│   ├── schema-to-graphql/
│   ├── data-migration/
│   └── contribution-assistant/
│
├── 📁 design/                           # 设计资源
│   ├── README.md
│   ├── brand/
│   │   ├── logo/
│   │   ├── colors/
│   │   └── typography/
│   ├── ui-components/
│   └── assets/
│       └── world-map/
│
├── 📁 research/                         # 研究报告
│   ├── README.md
│   ├── 2026/
│   │   ├── global-mobility-report.md
│   │   ├── nomad-survey-results.md
│   │   └── visa-policy-trends.md
│   └── methodology/
│       └── data-collection.md
│
├── 📄 README.md                         # 项目总览
├── 📄 LICENSE                           # MIT License
├── 📄 CHANGELOG.md                      # 变更日志
├── 📄 CODE_OF_CONDUCT.md               # 行为准则
├── 📄 CONTRIBUTING.md                   # 贡献指南
├── 📄 CONTRIBUTORS.md                   # 贡献者列表
├── 📄 SECURITY.md                       # 安全政策
├── 📄 .gitignore
└── 📄 package.json                      # 根package.json
```

## 目录大小预估 (3年后)

| 目录 | 当前 | Year 1 | Year 2 | Year 3 |
|------|------|--------|--------|--------|
| schemas/ | 0 | 50KB | 80KB | 100KB |
| datasets/ | ~500KB | 5MB | 15MB | 30MB |
| api/ | 0 | 100KB | 200KB | 300KB |
| packages/ | 0 | 200KB | 500KB | 1MB |
| mcp/ | 0 | 50KB | 100KB | 150KB |
| ai/ | 0 | 10MB | 50MB | 100MB |
| website/ | 50MB | 30MB | 40MB | 50MB |
| docs/ | 0 | 1MB | 3MB | 5MB |
| examples/ | 0 | 500KB | 2MB | 5MB |
| **总计** | **~50MB** | **~17MB** | **~71MB** | **~191MB** |
