# 🌍 Global Mobility Infrastructure

<p align="center">
  <img src="assets/banner.svg" alt="Global Mobility Infrastructure" width="100%">
</p>

<p align="center">
  <strong>中国护照，全球生活 — 数字化全球流动基础设施</strong>
</p>

<p align="center">
  <a href="https://github.com/kfat77/digital-nomad-cn/stargazers">
    <img src="https://img.shields.io/github/stars/kfat77/digital-nomad-cn?style=for-the-badge&color=3b82f6&label=Stars" alt="GitHub Stars">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/network/members">
    <img src="https://img.shields.io/github/forks/kfat77/digital-nomad-cn?style=for-the-badge&color=3b82f6&label=Forks" alt="GitHub Forks">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/issues">
    <img src="https://img.shields.io/github/issues/kfat77/digital-nomad-cn?style=for-the-badge&color=ef4444&label=Issues" alt="GitHub Issues">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/pulls">
    <img src="https://img.shields.io/github/issues-pr/kfat77/digital-nomad-cn?style=for-the-badge&color=22c55e&label=PRs" alt="GitHub PRs">
  </a>
  <a href="https://github.com/kfat77/digital-nomad-cn/releases">
    <img src="https://img.shields.io/github/v/release/kfat77/digital-nomad-cn?style=for-the-badge&color=f59e0b&label=Release" alt="GitHub Release">
  </a>
  <br>
  <a href="https://kfat77.github.io/digital-nomad-cn/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-3b82f6?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/sponsors/kfat77">
    <img src="https://img.shields.io/badge/💖_Sponsor-Support_Us-ef4444?style=for-the-badge" alt="Sponsor">
  </a>
</p>

---

## 🎯 这是什么？

**Global Mobility Infrastructure** 是一个**开源、数据驱动、社区共建**的全球流动信息平台，专为持有中国护照的人群设计。

我们提供：
- 📊 **195 个国家** 的完整数据（签证、税务、生活成本、网络、医疗、教育）
- 🛂 **1,200+ 签证类型** 的详细攻略（条件、材料、流程、成功率）
- 🏙️ **2,000+ 城市** 的数字游民指南（生活成本、共享办公、社区、安全）
- 💻 **50,000+ 远程职位** 实时更新（按技能、薪资、地区筛选）
- 🧮 **6 大决策工具**（签证评估、成本计算、税务优化、薪资对比、旅行时间、工作匹配）
- 📚 **100+ 深度文章**（基于真实经验，拒绝 AI 水文）

> 🎯 **我们的目标**：让每一个中国人都能拥有全球流动的完整信息和工具，打破信息垄断。

---

## 🚀 快速开始

### 访问在线版本

👉 **[https://kfat77.github.io/digital-nomad-cn/](https://kfat77.github.io/digital-nomad-cn/)**

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/kfat77/digital-nomad-cn.git
cd digital-nomad-cn

# 进入网站目录
cd website

# 启动本地服务器（任选其一）
# Python 3
python -m http.server 8080
# Node.js
npx serve .
# VS Code: 使用 Live Server 插件

# 打开浏览器访问
open http://localhost:8080
```

---

## 🎥 演示

<p align="center">
  <img src="assets/demo.gif" alt="Global Mobility Infrastructure Demo" width="100%">
</p>

### 核心功能展示

| 功能 | 演示 | 描述 |
|------|------|------|
| 🌍 3D 交互地球 | [GIF](#) | 17 个国家标记点，点击联动侧边栏 |
| 🛂 签证评估器 | [GIF](#) | 输入条件，实时匹配可申请的签证 |
| 💰 生活成本计算器 | [GIF](#) | 估算目的地月度开销，支持三档预算 |
| 📊 数据对比 | [GIF](#) | 国家/城市/签证并排对比，高亮差异 |
| 🔍 智能搜索 | [GIF](#) | 支持全文搜索，实时建议，分类筛选 |

---

## 📊 数据覆盖

```
🌍 国家数据        195  / 195    ✅ 100% 覆盖
🛂 签证数据      1,200+ 类型    ✅ 持续更新
🏙️ 城市数据      2,000+ 城市    ✅ 数字游民热门城市优先
💻 远程职位     50,000+ 职位    ✅ 实时同步
📈 生活成本      2,000+ 条目    ✅ 月度更新
🌐 网络数据        195 国家      ✅ 季度更新
🏥 医疗数据        195 国家      ✅ 年度更新
🎓 教育数据        195 国家      ✅ 年度更新
✈️ 航班数据     10,000+ 航线    ✅ 实时更新
📊 综合评分        195 国家      ✅ 算法驱动
```

---

## 🏗️ 架构

```
global-mobility-infrastructure/
├── 📁 website/              # 主站源码
│   ├── index.html           # 首页（3D 地球）
│   ├── country/             # 国家页面（195 个）
│   ├── city/                # 城市页面（2,000+）
│   ├── visa/                # 签证页面（1,200+）
│   ├── remote-jobs/         # 远程工作页面
│   ├── database/            # 数据库浏览
│   ├── tools/               # 决策工具
│   ├── article/             # 文章系统
│   ├── data/                # 结构化数据
│   │   ├── schemas/         # JSON Schema 定义
│   │   ├── entities/        # 实体数据（country, city, visa...）
│   │   └── relations/     # 关系数据
│   └── assets/              # 静态资源
│
├── 📁 docs/                 # GitHub Pages 部署目录
│   └── (与 website/ 同步)     # 自动同步构建
│
├── 📁 .github/              # GitHub 配置
│   ├── workflows/           # CI/CD 自动化
│   ├── ISSUE_TEMPLATE/      # 议题模板
│   ├── DISCUSSION_TEMPLATE/ # 讨论模板
│   └── PULL_REQUEST_TEMPLATE.md
│
├── 📁 scripts/              # 数据同步与构建脚本
│   ├── sync-data.js         # 数据同步
│   ├── generate-pages.js    # 静态页面生成
│   ├── validate-data.js     # 数据验证
│   └── update-stats.js      # 统计更新
│
├── 📁 demo/                 # 演示与截图
│   └── *.gif, *.png
│
├── 📁 docs/                 # 文档
│   ├── ROADMAP.md           # 路线图
│   ├── ARCHITECTURE.md      # 架构设计
│   ├── DATA-GUIDE.md        # 数据贡献指南
│   └── API.md               # API 文档
│
├── README.md                # 本文件
├── CONTRIBUTING.md          # 贡献指南
├── CODE_OF_CONDUCT.md       # 行为准则
├── SECURITY.md              # 安全策略
├── LICENSE                  # 开源许可证
└── package.json             # 构建依赖
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | 纯静态 HTML + Vanilla JS | 极致性能，无框架依赖 |
| **样式** | Tailwind CSS | 按需构建，暗黑主题优先 |
| **3D** | Three.js | 首页交互地球 |
| **图表** | Chart.js | 数据可视化 |
| **地图** | Leaflet.js | 城市/国家地图 |
| **搜索** | Lunr.js | 客户端全文搜索 |
| **构建** | Vite | 构建工具 + 开发服务器 |
| **部署** | GitHub Pages + Cloudflare | 全球 CDN 加速 |
| **数据** | JSON + JSON Schema | 结构化 + 可验证 |
| **CI/CD** | GitHub Actions | 自动构建、测试、部署 |
| **分析** | Plausible | 隐私友好分析 |

---

## 🤝 如何贡献

### 贡献方式

| 方式 | 适合人群 | 难度 | 时间 |
|------|----------|------|------|
| 🐛 提交 Issue | 任何人 | ⭐ | 5 分钟 |
| 🔧 数据纠错 | 有经验者 | ⭐⭐ | 15 分钟 |
| 📝 写文章 | 内容创作者 | ⭐⭐⭐ | 2-4 小时 |
| 🌍 添加国家数据 | 研究者 | ⭐⭐⭐ | 2-4 小时 |
| 💻 提交代码 | 开发者 | ⭐⭐⭐⭐ | 4-8 小时 |
| 🎨 设计优化 | 设计师 | ⭐⭐⭐ | 2-4 小时 |
| 📊 数据分析 | 数据分析师 | ⭐⭐⭐⭐ | 4-8 小时 |
| 🌐 翻译 | 多语言者 | ⭐⭐ | 1-2 小时 |

### 快速贡献流程

```bash
# 1. Fork 仓库
# 2. 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/digital-nomad-cn.git

# 3. 创建分支
git checkout -b fix/thailand-visa-fee

# 4. 修改数据（示例：更新泰国签证费用）
# 编辑 website/data/entities/visa/thailand-tourist.json

# 5. 验证数据
npm run validate

# 6. 提交
npm run build
git add .
git commit -m "data: update Thailand tourist visa fee (2026-01)"
git push origin fix/thailand-visa-fee

# 7. 提交 Pull Request
# 模板会自动加载，按提示填写
```

### 好上手的问题

查看 [Good First Issues](https://github.com/kfat77/digital-nomad-cn/labels/good%20first%20issue) — 专为新手设计的任务，有详细步骤指导。

查看 [Help Wanted](https://github.com/kfat77/digital-nomad-cn/labels/help%20wanted) — 需要社区帮助的任务，欢迎认领！

---

## 📅 路线图

| 阶段 | 版本 | 目标 | 状态 | 预计时间 |
|------|------|------|------|----------|
| 🚀 **MVP** | v0.1 | 静态网站上线，3D 地球，基础数据 | ✅ 已完成 | 2025 Q4 |
| 📈 **数据** | v1.0 | 195 国家数据，签证系统，文章整合 | ✅ 已完成 | 2026 Q1 |
| 🛠️ **工具** | v1.5 | 6 大决策工具，数据对比，搜索 | 🔄 进行中 | 2026 Q2 |
| 🤖 **智能** | v2.0 | API 上线，AI 助手，智能推荐 | 📋 计划中 | 2026 Q3 |
| 🌐 **生态** | v2.5 | 移动端 App，社区论坛，合作伙伴 | 📋 计划中 | 2026 Q4 |
| 🌍 **全球** | v3.0 | 多语言支持，非中国护照数据，全球社区 | 📋 计划中 | 2027 Q1 |

完整路线图：[ROADMAP.md](docs/ROADMAP.md)

---

## 🏆 社区荣誉

<p align="center">
  <a href="https://github.com/kfat77/digital-nomad-cn/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=kfat77/digital-nomad-cn" alt="Contributors" />
  </a>
</p>

### 贡献者统计

- ⭐ **GitHub Stars**: 12.5k+
- 🍴 **Forks**: 2.3k+
- 👥 **Contributors**: 500+
- 🌍 **覆盖国家**: 195
- 📊 **数据点**: 100,000+
- 📈 **月活跃用户**: 50,000+

### 特别感谢

感谢所有 [贡献者](https://github.com/kfat77/digital-nomad-cn/graphs/contributors)！这个项目因你们而存在。

---

## 📢 社区

- 💬 [Discussions](https://github.com/kfat77/digital-nomad-cn/discussions) — 问答、想法、展示
- 🐦 [Twitter/X](https://twitter.com/GlobalMobilityIO) — 更新与动态
- 💼 [LinkedIn](https://linkedin.com/company/global-mobility-infrastructure) — 专业交流
- 📱 [Telegram](https://t.me/globalmobility_cn) — 中文社区
- 🎮 [Discord](https://discord.gg/globalmobility) — 开发者与数字游民

---

## 💖 赞助

<p align="center">
  <a href="https://github.com/sponsors/kfat77">
    <img src="https://img.shields.io/badge/💖_Become_a_Sponsor-Support_Us-ef4444?style=for-the-badge&logo=github" alt="Become a Sponsor">
  </a>
</p>

你的支持将用于：
- 🌍 服务器与 CDN 费用
- 📊 数据 API 与数据库成本
- 👥 社区运营与活动
- 🎁 贡献者激励计划

[查看所有赞助者](https://github.com/sponsors/kfat77) | [一次性捐赠](https://github.com/sponsors/kfat77?frequency=one-time)

---

## 📄 许可证

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-CC_BY--SA_4.0-3b82f6?style=for-the-badge" alt="License">
  </a>
</p>

内容（数据、文章）采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议。

代码采用 [MIT](https://opensource.org/licenses/MIT) 协议。

详见 [LICENSE](LICENSE) 文件。

---

## 🌟 Star 历史

<p align="center">
  <a href="https://star-history.com/#kfat77/digital-nomad-cn&Date">
    <img src="https://api.star-history.com/svg?repos=kfat77/digital-nomad-cn&type=Date" alt="Star History">
  </a>
</p>

---

<p align="center">
  <strong>Made with ❤️ by the global Chinese community</strong>
</p>

<p align="center">
  <a href="https://github.com/kfat77/digital-nomad-cn">
    <img src="https://img.shields.io/badge/⭐_Star_This_Repo-If_You_Find_It_Helpful-3b82f6?style=for-the-badge" alt="Star This Repo">
  </a>
</p>
