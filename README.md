# Digital Nomad CN — 中文数字游民信息平台

<p align="center">
  <strong>数据优先 · 开源优先 · 为中文全球流动者服务</strong>
</p>

<p align="center">
  <a href="https://github.com/kfat77/digital-nomad-cn/stargazers">
    <img src="https://img.shields.io/github/stars/kfat77/digital-nomad-cn?style=flat&color=3b82f6&label=Stars" alt="GitHub Stars">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/actions">
    <img src="https://img.shields.io/badge/CI-Data_Validation-22c55e?style=flat" alt="CI">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-3b82f6?style=flat" alt="License">
  </a>
  <a href="https://kfat77.github.io/digital-nomad-cn/">
    <img src="https://img.shields.io/badge/🌐_Live_Site-Visit_Now-3b82f6?style=flat" alt="Live Site">
  </a>
</p>

<p align="center">
  <a href="https://kfat77.github.io/digital-nomad-cn/">🚀 网站首页</a> •
  <a href="https://kfat77.github.io/digital-nomad-cn/country/">🌍 国家数据库</a> •
  <a href="https://kfat77.github.io/digital-nomad-cn/china-passport/">🇨🇳 中国护照指南</a> •
  <a href="https://kfat77.github.io/digital-nomad-cn/articles/">📚 文章</a>
</p>

---

## 🚀 快速开始

> 数字游民出海前必做的三件事：银行卡、电话卡、证券账户

| 基础准备 | 链接 | 状态 |
|----------|------|------|
| 💳 银行卡 | [出海银行卡完整指南](https://kfat77.github.io/digital-nomad-cn/articles/digital-nomad-banking-guide/) | ✅ |
| 📱 电话卡 | [海外电话卡与 eSIM 攻略](https://kfat77.github.io/digital-nomad-cn/articles/giffgaff-guide-2026/) | ✅ |
| 📈 证券账户 | [全球证券账户开户指南](https://kfat77.github.io/digital-nomad-cn/articles/securities-guide/) | ✅ |
| 🇨🇳 中国护照 | [免签/落地签/电子签国家列表](https://kfat77.github.io/digital-nomad-cn/china-passport/) | ✅ **新增** |

👉 **[点击访问完整网站](https://kfat77.github.io/digital-nomad-cn/)**

---

## 📊 当前数据覆盖

| 数据类型 | 数量 | 状态 | 说明 |
|----------|------|------|------|
| 🌍 国家 | **100** | ✅ 已结构化 | 覆盖 15 个区域，完整 JSON Schema |
| 📋 Schema | **1** | ✅ 稳定 | country.schema.json (draft-07) |
| ✅ 数据校验 | ✅ | ✅ CI | GitHub Actions 自动 Schema 校验 |
| 🇨🇳 中国护照数据 | **55** | ✅ 已上线 | 免签/落地签/电子签国家 |
| 🏙️ 城市 | **122** | 🚧 待结构化 | 将逐步迁移到 datasets/ |
| 🛂 签证数据 | 10国 | 🚧 待完善 | 见 [data-audit-report.md](data-audit-report.md) |

---

## 📁 项目结构

```
digital-nomad-cn/
├── 📁 datasets/              # 数据集（核心资产）
│   ├── countries.json        # 100 国结构化数据
│   ├── china-passport.json   # 中国护照友好国家数据
│   └── index.json
├── 📁 schemas/               # 数据定义
│   └── country.schema.json
├── 📁 docs/                   # GitHub Pages 网站
│   ├── index.html            # 首页
│   ├── country/              # 国家详情页
│   ├── china-passport/       # 中国护照出行指南
│   └── articles/             # 文章
├── 📁 .github/workflows/     # CI/CD
│   ├── data-validation.yml   # 数据校验
│   └── test.yml              # 测试与 lint
├── 📁 scripts/                # 自动化脚本
├── 📁 architecture/           # 架构文档
├── package.json
├── README.md
└── LICENSE
```

---

## 📊 Open Data

本项目的数据集完全开源（MIT + CC BY-SA 4.0）：

| 渠道 | 链接 | 说明 |
|------|------|------|
| **Raw JSON** | `datasets/countries.json` | 直接读取 |
| **GitHub Pages** | [kfat77.github.io/digital-nomad-cn](https://kfat77.github.io/digital-nomad-cn/) | 可视化网站 |

### 引用本数据集

```bibtex
@dataset{digital_nomad_cn_2026,
  author = {{Digital Nomad CN Contributors}},
  title = {Digital Nomad CN — 中文数字游民信息平台},
  year = {2026},
  url = {https://github.com/kfat77/digital-nomad-cn}
}
```

---

## 🤝 如何贡献

1. Fork 仓库
2. 编辑 `datasets/countries.json` 或 `datasets/china-passport.json`
3. 数据必须符合 `schemas/country.schema.json`
4. 运行 `npm run validate` 校验
5. 提交 PR

完整贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📅 数据来源

- **签证数据**：中国领事服务网 (cs.mfa.gov.cn) 及各国官方移民部门
- **基础地理数据**：World Bank Open Data、ISO 标准
- **更新频率**：签证数据每季度核查一次；基础数据按需更新
- **数据验证**：所有数据变更通过 GitHub Actions 自动 Schema 校验
- **免责声明**：签证政策随时可能变化，出行前请务必通过目的国官方渠道确认最新政策

---

## 🛡️ 已知限制与 Roadmap

| 功能 | 状态 | 说明 |
|------|------|------|
| 100 国数据集 | ✅ | 已结构化，可验证 |
| GitHub Pages 网站 | ✅ | 已部署 |
| JSON Schema | ✅ | 稳定，v2.0.0 |
| 中国护照出行指南 | ✅ | 55国签证数据已上线 |
| `data_sources` 字段 | ✅ | Schema 已支持，数据填充中 |
| 签证数据完整覆盖 | 🚧 | 10个热门国已审计，待补充到 countries.json |
| REST API | 🚧 | 未部署，规划中 |
| MCP Server | 🚧 | 开发中，未发布 |
| npm SDK | 🚧 | 未发布 |

---

## 📄 许可证

- 内容（数据、文章）：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- 代码：[MIT](https://opensource.org/licenses/MIT)

---

<p align="center">
  <strong>Made with ❤️ for the Chinese global mobility community</strong>
</p>
