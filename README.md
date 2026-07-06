# 🌍 Global Mobility Open Infrastructure

<p align="center">
  <strong>全球最大的中文 Global Mobility 开放数据基础设施</strong>
</p>

<p align="center">
  <a href="https://github.com/kfat77/digital-nomad-cn/stargazers">
    <img src="https://img.shields.io/github/stars/kfat77/digital-nomad-cn?style=flat&color=3b82f6&label=Stars" alt="GitHub Stars">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/network/members">
    <img src="https://img.shields.io/github/forks/kfat77/digital-nomad-cn?style=flat&color=3b82f6&label=Forks" alt="GitHub Forks">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/issues">
    <img src="https://img.shields.io/github/issues/kfat77/digital-nomad-cn?style=flat&color=ef4444&label=Issues" alt="GitHub Issues">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/actions">
    <img src="https://img.shields.io/badge/CI-Data_Validation-22c55e?style=flat" alt="CI">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-3b82f6?style=flat" alt="License">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/releases">
    <img src="https://img.shields.io/badge/Open_Data-v2.0.0-f59e0b?style=flat" alt="Open Data">
  </a>
  <br>
  <a href="https://kfat77.github.io/digital-nomad-cn/">
    <img src="https://img.shields.io/badge/🌐_Live_Site-Visit_Now-3b82f6?style=flat" alt="Live Site">
  </a>
</p>

---

## 🎯 项目愿景

> **Data First · API First · AI First · Open Source First · Developer First**

这个项目正在从"一个优秀的网站"进化为"全球最大的中文 Global Mobility Open Infrastructure"。

### 核心转变

| | V1（过去） | V2（现在） |
|---|---|---|
| **核心资产** | HTML 页面 | **结构化数据 + API + 社区** |
| **数据位置** | 嵌入在 JS 中 | **独立的 `datasets/` + `schemas/`** |
| **消费者** | 网站访问者 | **AI Agent / 开发者 / 网站 / App** |
| **存在性** | 网站消失 = 项目消失 | **网站只是消费者之一** |

### 为什么这个项目重要？

- **信息垄断**：全球流动信息长期被英语世界垄断，中文用户缺乏系统、可信的数据来源
- **数据开源**：所有数据完全开源（MIT + CC BY-SA 4.0），任何人可验证、改进、复用
- **AI 就绪**：结构化 JSON Schema + MCP Server，ChatGPT/Claude/Cursor 可直接调用
- **社区共建**：数据由社区共同维护，确保准确和时效

---

## 📊 当前数据覆盖

| 数据类型 | 数量 | 状态 | 说明 |
|----------|------|------|------|
| 🌍 国家 | **100** | ✅ 已结构化 | 覆盖 15 个区域，完整 JSON Schema |
| 📋 Schema | **1** | ✅ 稳定 | country.schema.json (draft-07) |
| 🔄 数据同步 | ✅ | ✅ 自动 | datasets/ → website/ 单向同步 |
| ✅ 数据校验 | ✅ | ✅ CI | GitHub Actions 自动 Schema 校验 |
| 🏙️ 城市 | **122** | 🚧 待结构化 | 将逐步迁移到 datasets/ |
| 🛂 签证数据 | **100** | 🚧 待完善 | 基础框架就绪，内容持续补充 |

---

## 🚀 Open Data 发布

本项目的数据集已通过以下渠道发布：

| 渠道 | 链接 | 说明 |
|------|------|------|
| **GitHub Releases** | [Releases](https://github.com/kfat77/digital-nomad-cn/releases) | 版本化数据集下载 |
| **Raw JSON** | `datasets/countries.json` | 直接读取 |
| **REST API** | `https://api.digital-nomad.cn/v1/countries` | 实时 API |
| **GraphQL** | `https://api.digital-nomad.cn/graphql` | 灵活查询 |
| **npm SDK** | `@digital-nomad-cn/sdk` | TypeScript SDK |

### 引用本数据集

```bibtex
@dataset{digital_nomad_cn_2026,
  author = {{Digital Nomad CN Contributors}},
  title = {Digital Nomad CN — Global Mobility Open Dataset},
  year = {2026},
  version = {2.0.0},
  url = {https://github.com/kfat77/digital-nomad-cn}
}
```

---

## 🏗️ V2 架构

```
digital-nomad-cn/
│
├── 📁 schemas/              # ⭐ 数据定义（核心资产）
│   ├── country.schema.json  # JSON Schema (draft-07)
│   └── README.md
│
├── 📁 datasets/             # ⭐ 数据集（核心资产）
│   ├── index.json           # 数据总索引
│   ├── countries.json       # 100 国结构化数据
│   ├── visa-official-links.json
│   └── README.md
│
├── 📁 api/                  # ⭐ API 服务
│   ├── src/
│   │   ├── index.ts         # REST + GraphQL 入口
│   │   ├── graphql/         # GraphQL 实现
│   │   └── routes/          # REST 路由
│   └── wrangler.toml        # Cloudflare Workers
│
├── 📁 packages/             # ⭐ SDK 包
│   └── js-sdk/              # @digital-nomad-cn/sdk
│
├── 📁 website/              # 网站（消费者之一）
│   ├── index.html           # 首页
│   ├── countries-data.js    # 由 datasets/ 自动生成
│   └── ...
│
├── 📁 architecture/         # 架构文档
│   └── v2/                  # V2 完整架构设计
│       ├── 01-philosophy.md
│       ├── 02-modules.md
│       ├── 03-data-layer/   # 18 个 Schema 定义
│       ├── 04-api-layer.md  # REST/GraphQL/MCP 设计
│       ├── 05-github-structure.md
│       ├── 06-open-source-ecosystem.md
│       ├── 07-ai-capabilities.md
│       └── 08-roadmap.md
│
├── 📁 .github/workflows/    # CI/CD
│   ├── data-validation.yml  # PR 自动数据校验
│   └── build-deploy.yml     # 自动构建部署
│
├── 📁 scripts/              # 自动化脚本
│   ├── extract-data.js      # 提取数据
│   ├── validate-data.js     # Schema 校验
│   └── sync-data-to-website.js
│
├── CITATION.cff             # 学术引用
├── datapackage.json         # 数据包标准
├── package.json
├── README.md
└── LICENSE
```

### 数据流

```
datasets/countries.json  ←── 唯一真相源
         │
         │ npm run sync:data
         ▼
website/countries-data.js ←── 自动生成，禁止手动编辑
         │
         │ npm run build
         ▼
docs/                     ←── GitHub Pages 部署
```

---

## 🚀 快速开始

### 在线访问

👉 **[https://kfat77.github.io/digital-nomad-cn/](https://kfat77.github.io/digital-nomad-cn/)**

### 开发者使用

```bash
# 1. 克隆仓库
git clone https://github.com/kfat77/digital-nomad-cn.git
cd digital-nomad-cn

# 2. 安装依赖
npm install

# 3. 校验数据
npm run validate

# 4. 同步数据到网站
npm run sync:data

# 5. 构建
npm run build
```

### 直接读取数据

```javascript
// 读取结构化数据
const countries = require('./datasets/countries.json');

// 查找泰国
const thailand = countries.find(c => c.id === 'thailand');
console.log(thailand.name.zh);  // "泰国"
console.log(thailand.region);    // "southeast-asia"
```

### 使用 SDK

```bash
npm install @digital-nomad-cn/sdk
```

```typescript
import { NomadClient } from '@digital-nomad-cn/sdk';

const client = new NomadClient();

// 获取所有国家
const countries = await client.listCountries();

// 获取特定国家
const thailand = await client.getCountry('thailand');

// 搜索
const results = await client.search('东南亚 签证');
```

---

## 🤝 如何贡献数据

### 贡献流程（V2）

```bash
# 1. Fork 仓库

# 2. 修改数据
# 编辑 datasets/countries.json
# （数据必须符合 schemas/country.schema.json）

# 3. 校验数据
npm run validate

# 4. 同步到网站
npm run sync:data

# 5. 提交 PR
git add datasets/ website/countries-data.js
git commit -m "data: update Thailand visa info"
git push origin your-branch
```

### 数据规范

- 所有数据必须符合国家 JSON Schema
- 数据变更必须通过 `npm run validate` 校验
- 网站文件由脚本自动生成，**禁止手动编辑**

完整贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📅 V2 Roadmap

| 阶段 | 里程碑 | 目标 | 状态 |
|------|--------|------|------|
| **Phase 0** | M1 | Schema 体系建立 | ✅ 完成 |
| **Phase 0** | M2 | 数据层抽离（61国） | ✅ 完成 |
| **Phase 0** | M3 | 目录重构 + 自动管道 | ✅ 完成 |
| **Phase 1** | M4 | REST API v1 | ✅ 完成 |
| **Phase 1** | M5 | JS SDK 发布 | ✅ 完成 |
| **Phase 1** | M6 | 社区建设启动 | ✅ 完成 |
| **Phase 1** | M7 | 数据扩展到100国 | ✅ 完成 |
| **Phase 1** | M8 | 自动化管道完善 | ✅ 完成 |
| **Phase 1** | M9 | 开源生态初建 | ✅ 完成 |
| **Phase 1** | M10 | GraphQL API v1 | ✅ 完成 |
| **Phase 1** | M11 | **Open Data 发布** | 🚧 **进行中** |
| **Phase 1** | M12 | Year 1 总结 | 📋 计划 |
| **Phase 2** | M13 | MCP Server | 📋 计划 |
| **Phase 2** | M14 | Embedding 系统 | 📋 计划 |
| **Phase 2** | M15 | RAG 系统 | 📋 计划 |

完整路线图：[architecture/v2/08-roadmap.md](architecture/v2/08-roadmap.md)

---

## ⭐ Star History

<p align="center">
  <a href="https://star-history.com/#kfat77/digital-nomad-cn&Date">
    <img src="https://api.star-history.com/svg?repos=kfat77/digital-nomad-cn&type=Date" alt="Star History Chart" width="600">
  </a>
</p>

---

## 📄 许可证

- 内容（数据、文章）：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- 代码：[MIT](https://opensource.org/licenses/MIT)

---

<p align="center">
  <strong>Made with ❤️ for the Chinese global mobility community</strong>
</p>

<p align="center">
  <a href="https://github.com/kfat77/digital-nomad-cn">
    <img src="https://img.shields.io/badge/⭐_Star_This_Repo-If_You_Find_It_Helpful-3b82f6?style=flat" alt="Star This Repo">
  </a>
</p>
