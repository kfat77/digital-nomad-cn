# 🌍 Global Mobility Infrastructure

<p align="center">
  <strong>中国护照，全球生活 — 数字化全球流动基础设施</strong>
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
    <img src="https://github.com/kfat77/digital-nomad-cn/actions/workflows/data-update.yml/badge.svg" alt="CI/CD">
  </a>
  <br>
  <a href="https://kfat77.github.io/digital-nomad-cn/">
    <img src="https://img.shields.io/badge/🌐_Live_Site-Visit_Now-3b82f6?style=flat" alt="Live Site">
  </a>
</p>

---

## 🎯 这是什么？

**Global Mobility Infrastructure** 是一个**开源、数据驱动、社区共建**的全球流动信息平台，专为持有中国护照的人群设计。

> 🎯 **目标**：让每一个中国人都能拥有全球流动的完整信息和工具，打破信息垄断。

---

## 📊 当前数据覆盖

| 数据类型 | 数量 | 状态 | 说明 |
|----------|------|------|------|
| 🌍 国家 | **60** | ✅ 持续扩展 | 覆盖亚洲、欧洲、北美、南美、大洋洲、中东、非洲 |
| 🏙️ 城市 | **122** | ✅ 持续扩展 | 数字游民热门城市优先 |
| 🛂 签证数据 | **60** | ✅ 持续扩展 | 中国护照签证政策 + 数字游民签证（60 国全覆盖） |
| 🗺️ 数字游民路线 | **3** | ✅ 已上线 | 东南亚、欧洲申根、地中海 |
| 📊 对比工具 | **60** | ✅ 已上线 | 31 国对比 + 29 城对比，12 维度指标 |
| 🔍 搜索 | **242** | ✅ 已上线 | 60 国 + 122 城 + 60 对比页模糊搜索 |
| 📝 文章 | **3** | ✅ 已上线 | 数据驱动的深度文章：签证攻略、排名、指南 |
| 🔌 数据 API | **5** | ✅ 已上线 | 静态 JSON API，开放供 AI Agent 调用 |

---

## 🚀 快速开始

### 在线访问

👉 **[https://kfat77.github.io/digital-nomad-cn/](https://kfat77.github.io/digital-nomad-cn/)**

### 本地运行

```bash
git clone https://github.com/kfat77/digital-nomad-cn.git
cd digital-nomad-cn/website
python -m http.server 8080
# 打开 http://localhost:8080
```

---

## ✨ 核心功能

### 🌍 国家详情页
- 60 个国家完整数据：签证、生活成本、网络、安全、HDI、GDP
- **ECharts 雷达图**：7 维度综合评分可视化
- **全球对比条形图**：vs 全球平均值
- **相似目的地推荐**：基于相似度算法推荐 4 个相关国家

### 🏙️ 城市数据
- 122 个数字游民热门城市
- 生活成本、安全指数、网络速度、数字游民评分

### 🛂 签证信息
- 中国护照签证政策：免签、落地签、电子签、需签证
- 60 国签证档案：免签、落地签、电子签、需签证
- 数字游民签证状态标识

### 📊 国家对比工具
- 同时对比 2-4 个国家
- 12 个指标：评分、成本、安全、网速、HDI、GDP、签证、租金等
- 可视化进度条 + 排名图表
- 一键预设：东南亚、欧洲、数字游民友好、中国免签

### 🔍 站内搜索
- fuse.js 客户端模糊搜索
- 182 条数据（国家+城市）实时搜索
- 关键词高亮、类型筛选、URL 参数支持

### 🌐 英文版网站
- 完整的英文界面：首页、国家库、签证库、城市库、对比、搜索、路线
- **122 英文城市详情页** + **60 英文国家详情页** + **60 英文对比页**
- 双语导航切换（中文 / English）
- `hreflang` 标签支持，502 页全站 SEO 国际化
- 所有数据展示英文国家/城市名称

### 🤖 智能推荐引擎
- 回答 5 个问题，获得基于 60 国数据的个性化目的地推荐
- 5 维度匹配：预算、签证、网速、安全、地区
- 加权评分算法，Top 5 推荐 + 匹配理由
- 前三名对比表格
- 中英双语版本

### 📝 数据驱动文章
- 3 篇深度数据文章：免签指南、数字游民排名、签证完全指南
- 基于 60 国/122 城实时数据自动生成，确保信息一致性
- Article Schema.org 结构化标记，提升 AI Search 可见度

### 🗺️ 数字游民路线
- 3 条经典路线：东南亚环线、欧洲申根环、地中海慢游
- 含时间线、预算估算、签证串联策略、交通建议

### 🔌 开放数据 API
- 5 个静态 JSON 端点：国家、城市、签证、统计、清单
- 零后端依赖，AI Agent 可直接调用
- JSON Schema 定义，数据格式标准化
- 使用条款：CC BY-NC-SA 4.0

### 📱 PWA 离线支持
- 渐进式 Web 应用，可安装到主屏幕
- Service Worker 缓存全部核心页面 + CDN 资源
- 离线可浏览：推荐引擎、搜索、国家库、签证库
- 中英双语版本均支持离线
- 主题色 #3b82f6，适配 Android/iOS 安装体验

### 🤖 AI 签证助手
- 基于 Google Gemini（gemini-2.0-flash）的智能咨询
- 60 国数据作为系统上下文，回答基于真实数据
- 5 个快速问题按钮，一键获取常见咨询
- API Key 存储在浏览器 localStorage，完全隐私保护
- 支持签证推荐、国家对比、路线规划等咨询
- 中英双语版本

### 📊 自动化数据更新
- 每月自动抓取全球汇率数据（exchangerate-api.com）
- 异常检测：自动标记汇率/成本/安全指数的剧烈变化
- 数据新鲜度徽章：首页实时显示最后更新时间
- GitHub Actions 全自动工作流
- 检测到异常时自动创建 GitHub Issue 提醒维护者

### 🌐 3D 交互地球
- Three.js 渲染地球，标注 60 个国家
- 点击标记直接跳转国家详情页
- 鼠标悬停高亮，自动旋转

---

## 🏗️ 项目架构

```
digital-nomad-cn/
├── 📁 website/              # 主站源码
│   ├── index.html           # 首页（3D 地球）
│   ├── country/             # 国家页面（60 个）
│   ├── city/                # 城市页面（122 个）
│   ├── visa/                # 签证页面（60 个）
│   ├── compare/             # 对比工具（60 个：31 国 + 29 城）
│   ├── en/                  # 英文版完整镜像
│   │   ├── city/            # 122 英文城市详情页
│   │   ├── country/         # 60 英文国家详情页
│   │   ├── compare/         # 60 英文对比页
│   │   └── ...              # 英文版首页/列表/搜索/路线等
│   ├── search/              # 站内搜索（242 条数据）
│   ├── routes/              # 数字游民路线
│   ├── api/                 # 开放数据 API（静态 JSON）
│   │   ├── countries.json   # 60 国数据聚合
│   │   ├── cities.json      # 122 城数据聚合
│   │   ├── visas.json       # 60 签证数据聚合
│   │   ├── stats.json       # 统计摘要
│   │   ├── manifest.json    # AI Agent 发现接口
│   │   └── index.html       # API 文档页面
│   ├── data/                # 结构化数据
│   │   ├── schemas/         # JSON Schema 定义
│   │   └── entities/        # 实体数据（country, city, visa）
│   ├── scripts/             # 页面生成脚本
│   │   ├── generator.py     # 统一生成器（country/visa/city）
│   │   ├── country-template.html
│   │   └── generate-country-pages.py
│   └── images/og/           # Open Graph 预览图（60 张）
│
├── 📁 docs/                 # GitHub Pages 部署目录
│   └── (与 website/ 同步)
│
├── 📁 .github/
│   ├── workflows/           # CI/CD 自动化
│   │   ├── data-update.yml    # 月度数据更新 + 异常检测
│   │   └── sync-to-docs.yml   # 自动同步 website/ → docs/
│   └── ISSUE_TEMPLATE/    # 议题模板
│
├── 📁 docs/ (repo)        # 项目文档
│   ├── ARCHITECTURE.md
│   ├── DATA_ARCHITECTURE.md
│   ├── SEO_ARCHITECTURE.md
│   ├── AI_ARCHITECTURE.md
│   └── GROWTH_STRATEGY.md
│
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | 纯静态 HTML + Vanilla JS | 极致性能，无框架依赖 |
| **3D** | Three.js | 首页交互地球 |
| **图表** | ECharts | 雷达图、数据可视化 |
| **搜索** | fuse.js | 客户端模糊搜索 |
| **生成** | Python + Jinja-like | 静态页面生成 |
| **部署** | GitHub Pages | 自动部署 |
| **数据** | JSON + JSON Schema | 结构化 + 可验证 |
| **CI/CD** | GitHub Actions | 数据变更自动构建部署 |

---

## 🤝 如何贡献

### 贡献方式

| 方式 | 适合人群 | 难度 | 时间 |
|------|----------|------|------|
| 🐛 提交 Issue | 任何人 | ⭐ | 5 分钟 |
| 🔧 数据纠错 | 有经验者 | ⭐⭐ | 15 分钟 |
| 🌍 添加国家数据 | 研究者 | ⭐⭐⭐ | 1-2 小时 |
| 🏙️ 添加城市数据 | 本地居民 | ⭐⭐ | 30 分钟 |
| 💻 改进生成器 | 开发者 | ⭐⭐⭐⭐ | 2-4 小时 |
| 🎨 设计优化 | 设计师 | ⭐⭐⭐ | 2-4 小时 |

### 快速贡献流程

```bash
# 1. Fork 仓库
# 2. 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/digital-nomad-cn.git

# 3. 创建分支
git checkout -b add-country-romania

# 4. 添加数据
# 编辑 website/data/entities/country/romania.json
# （参考 website/data/schemas/country-detail.json）

# 5. 运行生成器
cd website/scripts
python generate-country-pages.py

# 6. 提交
git add .
git commit -m "data: add Romania country data"
git push origin add-country-romania

# 7. 提交 Pull Request
```

完整贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📅 路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| ✅ 国家详情页 | 60 国 + 雷达图 + 相似推荐 | 已完成 |
| ✅ 数据对比 | 4 国对比 + 12 指标 | 已完成 |
| ✅ 搜索 + 路线 | fuse.js 搜索 + 3 条路线 | 已完成 |
| ✅ 扩展数据 | 新增 18 国，累计 60 国 | 已完成 |
| ✅ 数据 API | 5 个静态 JSON 端点，开放 AI 调用 | 已完成 |
| ✅ 英文版 | 首页/国家/签证/城市/对比/搜索/路线 | 已完成 |
| ✅ 智能推荐 | 5 维匹配问卷 + 加权评分 + 中英双语 | 已完成 |
| ✅ PWA | 离线缓存、Service Worker、可安装到主屏幕 | 已完成 |
| ✅ AI 助手 | Gemini 驱动的签证咨询 + 中英双语 | 已完成 |
| ✅ 自动化数据 | 月度汇率更新 + 异常检测 + GitHub Actions | 已完成 |
| ✅ 更多城市 | 扩展至 120+ 城市 | 已完成 |
| ✅ 英文详情页 | 122 城 + 60 国详情页，中英双语对等 | 已完成 |
| ✅ 英文对比页 | 31 国对比 + 29 城对比，60 个英文对比页 | 已完成 |
| ✅ 数据质量 | 60 国签证数据补全 + 全站统计修复 + 浮点精度 | 已完成 |
| ✅ 多语言 SEO | 485 页 hreflang 标签 + 502 URL 站点地图 | 已完成 |
| ✅ 文章系统 | 数据驱动文章生成 + 3 篇首发 | 已完成 |
| 📋 社区功能 | 用户评论、评分、经验分享 | 计划中 |

完整路线图：[36MONTH_ROADMAP.md](docs/36MONTH_ROADMAP.md)

---

## ⭐ Star History

<p align="center">
  <a href="https://star-history.com/#kfat77/digital-nomad-cn&Date">
    <img src="https://api.star-history.com/svg?repos=kfat77/digital-nomad-cn&type=Date" alt="Star History Chart" width="600">
  </a>
</p>

---

## 👥 Contributors

感谢所有为这个项目做出贡献的人！

<p align="center">
  <a href="https://github.com/kfat77/digital-nomad-cn/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=kfat77/digital-nomad-cn" alt="Contributors" />
  </a>
</p>

<a href="https://github.com/kfat77/digital-nomad-cn/issues/new">成为第一个贡献者 →</a>

---

## 💖 赞助

你的支持将用于：
- 🌍 数据 API 与数据库成本
- 📊 数据更新与验证
- 👥 社区运营与活动

[成为赞助者](https://github.com/sponsors/kfat77)

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
