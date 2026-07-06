# 第五部分：GitHub Repo 目录结构重设计

## 核心转变

> 从"一个网站仓库"到"一个开发者平台"

```
Before (V1):
└── website/          ← 只有网站
    ├── index.html
    ├── app.js
    └── style.css

After (V2):
├── schemas/          ← 数据定义（核心资产）
├── datasets/         ← 数据集（核心资产）
├── api/              ← API服务
├── packages/         ← SDK包
│   ├── js-sdk/       ← npm: @digital-nomad-cn/sdk
│   ├── python-sdk/   ← pip: digital-nomad-cn
│   └── cli/          ← npm: @digital-nomad-cn/cli
├── mcp/              ← MCP Server
├── ai/               ← AI能力（Embedding/RAG）
├── website/          ← 网站（消费者之一）
├── docs/             ← 文档站点
├── examples/         ← 示例项目
├── scripts/          ← 自动化脚本
├── tools/            ← 开发者工具
├── design/           ← 设计资源
├── research/         ← 研究报告
└── .github/          ← GitHub配置
    ├── workflows/    ← CI/CD
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE/
```

---

## 详细目录设计

### 1. `schemas/` — 数据定义（核心）

```
schemas/
├── README.md                    # Schema说明文档
├── _meta/                       # 元数据
│   ├── schema-version.json      # 全局版本
│   ├── index.json               # 数据索引
│   └── changelog.json           # 变更日志
│
├── core/                        # 核心实体
│   ├── country.schema.json
│   ├── city.schema.json
│   └── region.schema.json
│
├── mobility/                    # 流动性
│   ├── passport.schema.json
│   ├── visa.schema.json
│   ├── flight.schema.json
│   └── border.schema.json
│
├── living/                      # 生活
│   ├── cost.schema.json
│   ├── salary.schema.json
│   ├── currency.schema.json
│   └── tax.schema.json
│
├── infrastructure/              # 基础设施
│   ├── internet.schema.json
│   ├── cowork.schema.json
│   ├── coliving.schema.json
│   ├── bank.schema.json
│   └── insurance.schema.json
│
├── quality/                     # 质量
│   ├── safety.schema.json
│   ├── healthcare.schema.json
│   ├── education.schema.json
│   └── weather.schema.json
│
└── derived/                     # 派生
    ├── ranking.schema.json
    ├── nomad-score.schema.json
    └── comparison.schema.json
```

**存在意义：** 这是项目的"宪法"。所有数据必须符合这些Schema。Schema定义了数据的结构、类型、关系和约束。

---

### 2. `datasets/` — 数据集（核心）

```
datasets/
├── README.md
├── countries/                   # 按国家组织
│   ├── thailand/
│   │   ├── country.json         # 国家基础信息
│   │   ├── cities/
│   │   │   ├── bangkok.json
│   │   │   └── chiang-mai.json
│   │   ├── visa.json
│   │   ├── tax.json
│   │   ├── cost.json
│   │   ├── internet.json
│   │   ├── safety.json
│   │   ├── healthcare.json
│   │   └── weather.json
│   ├── japan/
│   │   └── ...
│   └── ... (177个国家)
│
├── global/                      # 全球数据
│   ├── passport-index.json      # 护照排名
│   ├── visa-matrix.json         # 签证矩阵
│   └── exchange-rates.json      # 汇率
│
└── index.json                   # 数据索引
```

**存在意义：** 这是项目的"血液"。实际的数据内容，由社区贡献，经过Schema校验后存储。

---

### 3. `api/` — API服务

```
api/
├── README.md
├── src/
│   ├── index.ts                 # 入口
│   ├── routes/                  # 路由定义
│   │   ├── countries.ts
│   │   ├── cities.ts
│   │   ├── visa.ts
│   │   └── search.ts
│   ├── resolvers/               # GraphQL Resolvers
│   │   ├── country.ts
│   │   └── city.ts
│   ├── mcp/                     # MCP Server
│   │   ├── server.ts
│   │   └── tools/
│   │       ├── search-countries.ts
│   │       ├── get-visa.ts
│   │       └── compare-costs.ts
│   ├── validators/              # 数据校验
│   │   └── schema-validator.ts
│   └── utils/
│       ├── cache.ts
│       └── i18n.ts
│
├── wrangler.toml               # Cloudflare Workers配置
├── package.json
└── tsconfig.json
```

**存在意义：** 让数据可被程序化访问。REST、GraphQL、MCP三种接口服务全球开发者和AI Agent。

---

### 4. `packages/` — SDK包

```
packages/
├── js-sdk/                      # JavaScript/TypeScript SDK
│   ├── src/
│   │   ├── client.ts            # API客户端
│   │   ├── types.ts             # TypeScript类型（从Schema生成）
│   │   └── utils.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── python-sdk/                  # Python SDK
│   ├── digital_nomad_cn/
│   │   ├── __init__.py
│   │   ├── client.py
│   │   └── models.py            # Pydantic模型（从Schema生成）
│   ├── pyproject.toml
│   └── README.md
│
└── cli/                         # 命令行工具
    ├── src/
    │   ├── commands/
    │   │   ├── search.ts
    │   │   ├── validate.ts
    │   │   ├── build.ts
    │   │   └── contribute.ts
    │   └── index.ts
    ├── package.json
    └── README.md
```

**存在意义：** 降低开发者使用门槛。`npm install @digital-nomad-cn/sdk` 即可获得类型安全的数据访问能力。

---

### 5. `mcp/` — MCP Server

```
mcp/
├── README.md
├── src/
│   ├── server.ts
│   ├── tools/
│   │   ├── index.ts
│   │   ├── search-countries.ts
│   │   ├── get-country.ts
│   │   ├── search-cities.ts
│   │   ├── get-visa.ts
│   │   ├── compare-costs.ts
│   │   ├── calculate-tax.ts
│   │   ├── find-coworking.ts
│   │   └── recommend-destinations.ts
│   └── utils/
│       └── data-loader.ts
├── package.json
└── tsconfig.json
```

**存在意义：** AI时代的核心入口。让ChatGPT、Claude、Cursor等可以直接调用项目数据。

---

### 6. `ai/` — AI能力

```
ai/
├── README.md
├── embeddings/                  # Embedding生成
│   ├── generate.ts
│   └── models/
│       ├── country-embeddings.json
│       └── city-embeddings.json
│
├── rag/                         # RAG系统
│   ├── query.ts
│   └── context-builder.ts
│
├── semantic-search/             # 语义搜索
│   ├── index.ts
│   └── search.ts
│
└── structured-output/           # 结构化输出Schema
    ├── destination-recommendation.json
    ├── visa-guide.json
    └── cost-comparison.json
```

**存在意义：** 让数据在AI时代产生指数级价值。Embedding、RAG、Semantic Search让AI能"理解"数据。

---

### 7. `website/` — 网站（消费者之一）

```
website/
├── README.md
├── src/                         # 源码
│   ├── pages/                   # 页面
│   ├── components/              # 组件
│   ├── data/                    # 构建时数据（从datasets/生成）
│   └── styles/
├── static/                      # 静态资源
├── astro.config.mjs             # Astro配置
└── package.json
```

**存在意义：** 面向普通用户的内容消费界面。从`datasets/`自动生成，不存储数据。

---

### 8. `docs/` — 文档

```
docs/
├── README.md
├── .vitepress/                  # VitePress配置
│   └── config.ts
├── guide/                       # 用户指南
│   ├── getting-started.md
│   ├── api-reference.md
│   └── sdk-usage.md
├── contributing/                # 贡献指南
│   ├── how-to-contribute.md
│   ├── data-guidelines.md
│   └── schema-reference.md
├── architecture/                # 架构文档
│   ├── overview.md
│   ├── data-layer.md
│   └── api-design.md
└── faq.md                       # 常见问题
```

**存在意义：** 让开发者和贡献者理解项目。好的文档是开源项目成功的关键。

---

### 9. `examples/` — 示例

```
examples/
├── README.md
├── nextjs-nomad-app/            # Next.js示例
├── react-nomad-dashboard/       # React仪表板
├── python-nomad-analysis/       # Python数据分析
├── mcp-client-example/          # MCP客户端
├── api-integration/             # API集成示例
│   ├── nodejs/
│   ├── python/
│   └── go/
└── data-visualization/          # 数据可视化
    ├── d3/
    └── observable/
```

**存在意义：** 降低上手门槛。"看代码比看文档学得更快"。

---

### 10. `scripts/` — 自动化脚本

```
scripts/
├── README.md
├── validate-data.ts             # 数据校验
├── generate-index.ts            # 生成索引
├── generate-derived.ts          # 生成派生数据
├── build-website.ts             # 构建网站
├── sync-to-docs.ts              # 同步到docs/
└── release-dataset.ts           # 发布数据集
```

**存在意义：** 自动化所有重复工作。数据校验、索引生成、网站构建全部自动化。

---

### 11. `tools/` — 开发者工具

```
tools/
├── README.md
├── schema-to-typescript/        # Schema转TypeScript
├── schema-to-python/            # Schema转Python模型
├── schema-to-graphql/           # Schema转GraphQL
├── data-migration/              # 数据迁移工具
└── contribution-assistant/      # 贡献助手
```

**存在意义：** 提高开发者效率。Schema定义一次，自动生成TypeScript/Python/GraphQL类型。

---

### 12. `design/` — 设计资源

```
design/
├── README.md
├── brand/                       # 品牌规范
│   ├── logo/
│   ├── colors/
│   └── typography/
├── ui-components/               # UI组件
└── assets/                      # 通用资源
    └── world-map/
```

**存在意义：** 统一品牌视觉。所有消费者（网站、App、文档）共享一致的设计语言。

---

### 13. `research/` — 研究报告

```
research/
├── README.md
├── 2026/
│   ├── global-mobility-report.md
│   ├── nomad-survey-results.md
│   └── visa-policy-trends.md
└── methodology/                 # 研究方法
    └── data-collection.md
```

**存在意义：** 建立领域权威性。发布研究报告吸引媒体和学术引用。

---

### 14. `.github/` — GitHub配置

```
.github/
├── workflows/
│   ├── validate-data.yml        # 数据校验CI
│   ├── build-api.yml            # API构建CI
│   ├── build-website.yml        # 网站构建CI
│   ├── generate-docs.yml        # 文档生成CI
│   └── release.yml              # 发布CI
│
├── ISSUE_TEMPLATE/
│   ├── data-update.md           # 数据更新模板
│   ├── bug-report.md
│   ├── feature-request.md
│   └── new-country.md           # 新增国家模板
│
├── PULL_REQUEST_TEMPLATE/
│   ├── data-contribution.md     # 数据贡献模板
│   └── code-contribution.md     # 代码贡献模板
│
├── CODEOWNERS                   # 代码所有者
├── FUNDING.yml                  # 赞助
└── stale.yml                    # 自动清理旧Issue
```

**存在意义：** 自动化社区管理。Issue模板、PR模板、CI/CD全部标准化。

---

## 目录依赖关系

```
                    ┌─────────────┐
                    │   schemas   │ ← 所有数据的"宪法"
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ datasets   │  │ packages   │  │    api     │
    │ (数据)      │  │ (SDK/CLI)  │  │ (API服务)  │
    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
          │               │               │
          │    ┌──────────┴──────────┐    │
          │    │                     │    │
          ▼    ▼                     ▼    ▼
    ┌─────────────────────────────────────────┐
    │           CONSUMER LAYER                │
    │  ┌────────┐ ┌────────┐ ┌────────┐      │
    │  │website │ │examples│ │  docs  │      │
    │  └────────┘ └────────┘ └────────┘      │
    └─────────────────────────────────────────┘
```
