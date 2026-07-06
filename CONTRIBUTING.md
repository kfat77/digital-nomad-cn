#  Contributing to Global Mobility Infrastructure

感谢您对 **Global Mobility Infrastructure** 项目的兴趣！

>  **无论你是数据研究者、开发者、设计师，还是曾在某个国家生活过的数字游民，都可以为这个项目做出贡献。** 每一个 PR 都让全球华人数字游民受益。

---

##  快速开始（首次贡献者必读）

从未做过开源贡献？没关系！以下是最简单的 3 种贡献方式，不需要写代码：

| 方式 | 难度 | 时间 | 说明 |
|------|------|------|------|
| **修正数据错误** | ⭐ | 5 分钟 | 发现某个国家的签证政策或生活成本数据过时？直接编辑 JSON 文件 |
| **补充国家深度信息** | ⭐⭐ | 15 分钟 | 为你住过的国家补充 `pros`/`cons`/`ideal_for`/`best_neighborhoods` |
| **翻译内容** | ⭐⭐ | 20 分钟 | 将中文文章翻译成英文，或反之 |
| **报告问题** | ⭐ | 5 分钟 | 发现网站 bug 或数据错误？开一个新的 Issue |

###  首次贡献者 Step-by-Step

1. **Fork 仓库**：点击页面右上角的 "Fork" 按钮
2. **找到你想改的内容**：
   - 数据错误 → 编辑 `website/api/countries.json` 或 `cities.json`
   - 翻译内容 → 编辑对应的中/英文文章
   - 新内容 → 参考现有文章格式创建
3. **在线编辑**（无需本地环境）：GitHub 网页上直接编辑文件
4. **提交 PR**：编辑完成后点击 "Propose changes" → "Create pull request"
5. **等待 Review**：通常 24-48 小时内会有反馈

---

##  数据贡献

### 当前数据规模

| 数据类型 | 数量 | 说明 |
|----------|------|------|
| 国家 | 60 | 覆盖 7 大洲 |
| 城市 | 122 | 数字游民热门城市 |
| 签证档案 | 60 | 中国护照签证政策全覆盖 |
| 对比页 | 60 | 31 国对比 + 29 城对比 |
| 文章 | 18 | 中英双语深度指南 |
| 总页面 | 570+ | 中英双语 |

### 添加新国家

1. 在 `website/api/countries.json` 中添加新国家数据（参考现有格式）
2. 运行 `node scripts/generate-country-pages.js` 生成国家页面
3. 运行 `node scripts/sync-to-docs.js` 同步到 docs/
4. 提交 PR

### 添加新城市

1. 在 `website/api/cities.json` 中添加新城市数据
2. 运行 `node scripts/generate-city-pages.js` 生成城市页面（如需要）
3. 运行 `node scripts/sync-to-docs.js` 同步到 docs/
4. 提交 PR

### 数据更新

发现数据过时？直接编辑对应的 JSON 文件并提交 PR。

### 数据字段说明

**核心字段：**
- `id`: 唯一标识符（小写，英文）
- `name`: 中文名
- `name_en`: 英文名
- `region`: 地区（亚洲、欧洲、北美、南美、大洋洲、非洲、中东）
- `digital_nomad_score`: 0-100 综合评分
- `cost_of_living_index`: 0-100 生活成本指数（纽约=100）
- `safety_index`: 0-100 安全指数
- `internet_speed_avg_mbps`: 平均网速
- `china_passport_visa_status`: 中国护照签证状态
- `has_digital_nomad_visa`: 是否有数字游民签证

**深度字段（v1.2）：**
- `healthcare_quality`: 医疗质量 0-100
- `english_proficiency`: 英语普及度 0-100
- `rent_one_bedroom_usd`: 一居室租金
- `meal_avg_usd`: 平均餐费
- `transport_monthly_usd`: 月交通费
- `tax_rate_percent`: 税率
- `pros`: 优势列表（3-5条）
- `cons`: 劣势列表（3-5条）
- `ideal_for`: 适合人群（3条）
- `top_neighborhoods`: 推荐社区（3条）

---

##  首次贡献者 Checklist

提交 PR 前请确认：

- [ ] 我已阅读本贡献指南
- [ ] 我检查过该数据/功能尚未被贡献（搜索 Issues 和 PR）
- [ ] 我运行过 `node scripts/validate-data.js` 确保数据格式正确
- [ ] 我运行过 `node scripts/sync-to-docs.js` 同步到 docs/ 目录
- [ ] 我的提交信息遵循了提交规范（见下方）
- [ ] 如果是数据更新，我注明了信息来源

---

##  代码贡献

### 项目技术栈

- **纯静态 HTML/CSS/JS**（无框架）
- **ECharts** 用于数据可视化
- **Node.js** 用于页面生成和数据验证
- **GitHub Actions** 用于 CI/CD

### 关键脚本

- `scripts/generate-country-pages.js` — 生成 120 个国家详情页（CN+EN）
- `scripts/validate-data.js` — 数据 JSON Schema 验证
- `scripts/sync-to-docs.js` — 同步 website/ 到 docs/
- `scripts/bump-sw-cache.js` — 自动升级 Service Worker 缓存版本

### 页面修改流程

修改任何页面后，请按以下顺序执行：

```bash
# 1. 验证数据
node scripts/validate-data.js

# 2. 生成页面（如果修改了国家/城市数据）
node scripts/generate-country-pages.js

# 3. 同步到 docs/
node scripts/sync-to-docs.js

# 4. 提交
```

---

##  提交规范

```
data: update Thailand visa fee (2026-01)
feat: add new dashboard page
fix: correct Singapore safety index from 82 to 85
docs: update README with new stats
```

前缀说明：
- `data:` — 数据更新
- `feat:` — 新功能
- `fix:` — 修复错误
- `docs:` — 文档更新
- `refactor:` — 代码重构

---

##  PR 流程

1. **Fork** 仓库并创建 feature 分支（`git checkout -b feature/xxx`）
2. **修改并测试**：确保数据验证通过，页面生成正常
3. **提交 PR** 到 `main` 分支
4. **填写 PR 模板**：说明改了什么、为什么改、如何测试
5. **等待 Review**：通常 24-48 小时，如有问题会提出修改建议
6. **合并后**：你的名字会出现在 CONTRIBUTORS.md 中！

---

##  贡献者认可

所有贡献者都会在 [CONTRIBUTORS.md](./CONTRIBUTORS.md) 中获得感谢。无论贡献大小，都会被记录。

---

##  联系我们

- **Issues**: [报告问题或建议](https://github.com/kfat77/digital-nomad-cn/issues)
- **Discussions**: [一般性讨论](https://github.com/kfat77/digital-nomad-cn/discussions)
- **数据更新**: 直接提交 PR 或开 Issue 标注 "data update"

**感谢你的贡献！每一行代码、每一条数据，都在帮助全球数字游民做出更好的决策。**
