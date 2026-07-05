# 🤝 Contributing to Global Mobility Infrastructure

感谢你的兴趣！这个项目的核心精神是**社区共建**。无论你是想修正一个数据、写一篇攻略、还是贡献代码，这里都有你的位置。

---

## 📋 目录

- [快速开始](#快速开始)
- [贡献方式](#贡献方式)
- [数据贡献指南](#数据贡献指南)
- [代码贡献指南](#代码贡献指南)
- [文章贡献指南](#文章贡献指南)
- [翻译贡献指南](#翻译贡献指南)
- [提交规范](#提交规范)
- [审核流程](#审核流程)
- [新手任务](#新手任务)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 第一步：Fork 仓库

点击右上角的 **Fork** 按钮，将仓库复制到你的 GitHub 账户。

### 第二步：克隆本地

```bash
git clone https://github.com/YOUR_USERNAME/digital-nomad-cn.git
cd digital-nomad-cn
```

### 第三步：创建分支

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 或修复分支
git checkout -b fix/issue-description

# 或数据更新分支
git checkout -b data/country-visa-update
```

### 第四步：修改并提交

```bash
# 修改文件...
# 验证数据（如修改了数据）
npm run validate

# 构建
npm run build

# 提交
git add .
git commit -m "type: description"
git push origin your-branch-name
```

### 第五步：提交 Pull Request

在 GitHub 上点击 **Compare & pull request**，按模板填写信息。

---

## 🎯 贡献方式

### 🐛 提交 Issue

发现数据错误？功能建议？使用我们的 [Issue 模板](https://github.com/kfat77/digital-nomad-cn/issues/new/choose)。

| Issue 类型 | 用途 | 示例 |
|-----------|------|------|
| 🐛 Bug Report | 报告数据错误或功能缺陷 | "日本签证费用显示错误" |
| 📊 Data Update | 请求更新数据 | "泰国落地签政策已变更" |
| 📝 Article Request | 请求新文章 | "需要葡萄牙 D7 签证攻略" |
| 💡 Feature Request | 功能建议 | "希望添加航班价格追踪" |
| ❓ Question | 提问 | "如何贡献城市数据？" |

### 🔧 数据纠错

发现数据过时或错误？直接提交 PR！

**数据文件位置**：
```
website/data/entities/
├── country/          # 国家数据
├── city/             # 城市数据
├── visa/             # 签证数据
├── cowork/           # 共享办公数据
├── tax/              # 税务数据
├── internet/         # 网络数据
├── weather/          # 天气数据
├── salary/           # 薪资数据
├── cost/             # 消费数据
├── remote-job/       # 远程工作数据
├── flight/           # 航班数据
├── passport/         # 护照数据
├── healthcare/       # 医疗数据
└── education/        # 教育数据
```

**修改示例**：
```bash
# 1. 修改数据
vim website/data/entities/visa/japan-tourist.json

# 2. 验证格式
npm run validate

# 3. 提交
git add website/data/entities/visa/japan-tourist.json
git commit -m "data: update Japan tourist visa fee (2026-01-15)"
```

### 📝 写文章

**文章位置**：`website/docs/article/`

**文章格式**：Markdown，Frontmatter 元数据

```markdown
---
title: "日本数字游民签证：从申请到落地的完整指南"
author: "your-github-username"
date: "2026-01-15"
category: "visa-guide"
tags: ["日本", "数字游民签证", "申请攻略"]
countries: ["japan"]
cities: ["tokyo", "osaka"]
visa_types: ["digital_nomad"]
read_time: 15
---

# 正文...
```

**文章要求**：
- ✅ 基于真实经验或可靠来源
- ✅ 数据有引用（附链接）
- ✅ 拒绝 AI 生成水文
- ✅ 至少 2,000 字
- ✅ 包含实用的操作步骤
- ✅ 附相关数据页面链接

### 💻 贡献代码

**技术栈**：
- 纯静态 HTML + Vanilla JS
- Tailwind CSS
- 构建工具：Vite

**开发流程**：
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建（生产）
npm run build

# 验证
npm run validate

# 测试
npm run test

# 代码检查
npm run lint
```

### 🌐 翻译

我们计划支持多语言。如果你愿意翻译：

- 网站界面文本
- 国家/城市简介
- 文章（优先高流量内容）

**翻译文件**：`website/i18n/` 目录

---

## 📊 数据贡献详细指南

### 数据格式

所有数据使用 **JSON** 格式，遵循 **JSON Schema** 定义。

```json
{
  "id": "japan",
  "name": "日本",
  "nameEn": "Japan",
  "code_iso_3166_1": "JP",
  "region": "asia",
  "population": 125000000,
  "gdp_per_capita_usd": 39285,
  "updated_at": "2026-01-15T00:00:00Z",
  "source": "World Bank 2025",
  "contributor_ids": ["your-github-id"]
}
```

### 数据验证

提交前必须验证：

```bash
npm run validate
```

验证规则：
- ✅ 符合 JSON Schema
- ✅ 所有必填字段存在
- ✅ 日期格式正确
- ✅ 关联 ID 存在
- ✅ 无重复条目
- ✅ 数值在合理范围

### 数据来源

| 数据类型 | 推荐来源 | 可信度 |
|---------|----------|--------|
| 官方数据 | 政府官网、统计局、外交部 | ⭐⭐⭐⭐⭐ |
| 国际组织 | World Bank、UN、WHO、OECD | ⭐⭐⭐⭐⭐ |
| 第三方平台 | Numbeo、Glassdoor、Speedtest | ⭐⭐⭐⭐ |
| 社区经验 | 个人申请经验、实际体验 | ⭐⭐⭐ |
| 媒体报道 | 新闻、博客 | ⭐⭐ |

**标注来源**：每个数据字段必须标注 `source`。

---

## 💻 代码贡献详细指南

### 代码规范

```javascript
// ✅ 好：清晰、有注释、命名规范
function calculateVisaSuccessRate(applications) {
  const total = applications.length;
  const approved = applications.filter(a => a.status === 'approved').length;
  return total > 0 ? (approved / total * 100).toFixed(2) : 0;
}

// ❌ 不好：缩写、无注释、不清晰
function calcVSR(a) {
  return a.filter(x => x.s === 'a').length / a.length * 100;
}
```

### 文件命名

| 类型 | 命名 | 示例 |
|------|------|------|
| 数据文件 | kebab-case.json | `japan-tourist-visa.json` |
| 脚本 | kebab-case.js | `validate-data.js` |
| 组件 | PascalCase.js | `CountryCard.js` |
| 样式 | kebab-case.css | `country-detail.css` |
| 页面 | index.html | `country/japan/index.html` |

### 提交信息规范

```
类型: 描述

详细说明（可选）

相关 Issue: #123
```

**类型**：
| 类型 | 用途 | 示例 |
|------|------|------|
| `data` | 数据更新 | `data: update Japan visa fee` |
| `feat` | 新功能 | `feat: add visa eligibility checker` |
| `fix` | 修复 | `fix: correct Thailand visa duration` |
| `docs` | 文档 | `docs: add contributing guide` |
| `style` | 样式 | `style: improve mobile layout` |
| `refactor` | 重构 | `refactor: simplify data loading` |
| `test` | 测试 | `test: add data validation tests` |
| `chore` | 杂项 | `chore: update dependencies` |

---

## 🔍 审核流程

```
你提交 PR
    ↓
GitHub Actions 自动运行
  - 代码检查
  - 数据验证
  - 构建测试
    ↓
自动通过 ✅ / 失败 ❌（需修复）
    ↓
维护者审核
  - 数据准确性
  - 格式规范
  - 来源验证
    ↓
合并 🎉 / 请求修改 🔄
```

---

## 🌱 新手任务

第一次贡献？从这些开始：

### 数据纠错（5 分钟）
- [ ] 修正某个国家的 GDP 数据
- [ ] 更新某个签证的费用
- [ ] 补充某个城市的共享办公空间

### 写文章（2-4 小时）
- [ ] 写你申请过的签证经验
- [ ] 分享你在某个城市的生活
- [ ] 介绍某个国家的税务体系

### 代码（4-8 小时）
- [ ] 修复一个已知的 UI 问题
- [ ] 添加一个新的数据可视化组件
- [ ] 优化搜索功能

### 查看 [Good First Issues](https://github.com/kfat77/digital-nomad-cn/labels/good%20first%20issue)

---

## ❓ 常见问题

**Q: 我不会编程，可以贡献吗？**  
A: 当然可以！你可以提交数据纠错、写文章、翻译、或者提交 Issue 反馈问题。

**Q: 我的数据从哪里来？**  
A: 官方政府网站、国际组织、权威媒体报道。请标注来源。

**Q: 提交后多久会被审核？**  
A: 通常在 1-3 个工作日内。数据更新一般更快，功能修改可能需要更长时间。

**Q: 我的贡献会被署名吗？**  
A: 会！所有贡献者都会出现在 [Contributors](https://github.com/kfat77/digital-nomad-cn/graphs/contributors) 页面和 README 中。

**Q: 我不确定我的修改是否正确？**  
A: 先提交 Issue 询问，或者在 Discussion 中发帖讨论。维护者会帮助你。

---

## 🙏 行为准则

请遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。核心是：尊重、包容、建设性。

---

## 📞 需要帮助？

- 💬 [GitHub Discussions](https://github.com/kfat77/digital-nomad-cn/discussions) — 一般性讨论
- 🐛 [GitHub Issues](https://github.com/kfat77/digital-nomad-cn/issues) — 报告问题
- 📧 邮件：contributors@globalmobility.io
- 💼 Telegram 群：[t.me/globalmobility_cn](https://t.me/globalmobility_cn)

---

<p align="center">
  <strong>感谢你的贡献！每一个数据点、每一篇文章、每一行代码，都在帮助更多人实现全球流动。</strong>
</p>
