# Contributing to Global Mobility Infrastructure

感谢您对 Global Mobility Infrastructure 项目的兴趣！本指南将帮助您快速参与贡献。

> 🎉 **欢迎！** 无论你是数据研究者、开发者、设计师，还是曾在某个国家生活过的数字游民，都可以为这个项目做出贡献。每一个 PR 都让全球华人数字游民受益。

## 目录

- [数据贡献](#数据贡献)
- [代码贡献](#代码贡献)
- [提交规范](#提交规范)
- [PR 流程](#pr-流程)

---

## 数据贡献

### 当前数据规模

| 数据类型 | 数量 | 说明 |
|----------|------|------|
| 国家 | 60 | 覆盖 7 大洲 |
| 城市 | 122 | 数字游民热门城市 |
| 签证档案 | 60 | 中国护照签证政策全覆盖 |
| 对比页 | 60 | 31 国对比 + 29 城对比 |
| 总页面 | 502 | 中英双语 |

### 添加新国家

1. 在 `website/data/entities/country/` 创建 `{country_id}.json`
2. 按照 `website/data/schemas/country-detail.json` 填写数据
3. 运行 `node scripts/generate-en-country-pages.js` 生成英文国家页
4. 更新 `website/sitemap.xml` 添加新 URL
5. 提交 PR

**必填字段：**
- `id`: 唯一标识符（小写，用下划线分隔空格）
- `name`: 中文名
- `name_en`: 英文名
- `name_local`: 本地语言名
- `code_iso_3166_1`: ISO 3166-1 alpha-2 代码
- `region`: 地区（asia/europe/americas_north/americas_south/oceania/africa/middle_east）
- `coordinates`: {lat, lon}
- `timezone`: 时区数组
- `currency`: [{code, name, is_primary}]
- `languages`: [{code, name, is_official}]
- `population`: 整数
- `area_km2`: 整数
- `gdp_per_capita_usd`: 整数
- `hdi`: 0-1 浮点数
- `safety_index`: 数字
- `internet_speed_avg_mbps`: 数字
- `cost_of_living_index`: 数字
- `rent_index`: 数字
- `china_passport_visa_status`: visa_free/visa_on_arrival/evisa/visa_required/eta/special_permit
- `china_passport_visa_note`: 字符串
- `digital_nomad_score`: 0-100 整数
- `tags`: 标签数组
- `status`: published/draft/archived
- `updated_at`: 日期字符串

**深度字段（v1.2，可选）：**
- `healthcare_quality`: 0-100 数字（医疗质量评分）
- `english_proficiency`: 0-100 数字（英语普及度）
- `monthly_rent_usd_low`: 数字（最低月租金 USD）
- `monthly_rent_usd_high`: 数字（最高月租金 USD）
- `food_cost_usd_daily`: 数字（日均餐饮成本 USD）
- `transport_cost_usd_monthly`: 数字（月交通成本 USD）
- `coworking_spaces_count`: 整数（共享办公空间数量）
- `local_tax_rate`: 数字（本地税率百分比）
- `pros`: 字符串数组（优势列表）
- `cons`: 字符串数组（劣势列表）
- `ideal_for`: 字符串数组（适合人群）
- `best_neighborhoods`: 字符串数组（推荐社区）

### 添加新城市

1. 在 `website/data/entities/city/` 创建 `{city_id}.json`
2. 按照 `website/data/schemas/city-detail.json` 填写数据
3. 运行 `node scripts/generate-en-city-pages.js` 生成英文城市页
4. 更新 `website/en/cities/index.html` 添加新城市卡片链接
5. 更新 `website/sitemap.xml` 添加新 URL
6. 提交 PR

### 数据更新

发现数据过时？直接编辑对应的 JSON 文件并提交 PR。

---

## 首次贡献者指南

### 快速 checklist

- [ ] 我已阅读本贡献指南
- [ ] 我检查过该数据/功能尚未被贡献
- [ ] 我运行过 `node scripts/validate-data.js` 确保数据格式正确
- [ ] 我更新了 `website/sitemap.xml`（如添加新页面）
- [ ] 我更新了 `website/sw.js` 中的 CACHE_VERSION（如修改核心页面）
- [ ] 我运行过 `node scripts/sync-to-docs.js` 同步到 docs/ 目录
- [ ] 我的提交信息遵循了提交规范

---

## 代码贡献

### 页面生成器

项目使用 Node.js 脚本生成页面，关键脚本：

- `scripts/generate-en-city-pages.js` — 生成 122 个英文城市详情页
- `scripts/generate-en-country-pages.js` — 生成 60 个英文国家详情页
- `scripts/generate-en-compare-pages.js` — 生成 60 个英文对比页
- `scripts/update-sitemap-en.js` — 更新 sitemap.xml

### 英文页面贡献

修改英文页面时，请同步修改对应的：
1. 中文页面（如果内容源是中文）
2. 英文页面
3. `hreflang` 标签（已自动生成）
4. `sitemap.xml`（使用脚本更新）

### 多语言 SEO 贡献

添加新页面时，确保：
- 中英文版本 URL 结构一致（`/` vs `/en/`）
- 每个页面有 `canonical` 和 `hreflang` 标签
- 更新 `sitemap.xml`

---

## 提交规范

```
data: update Thailand visa fee (2026-01)
feat: add country comparison tool
fix: correct Singapore safety index
refactor: unify page generator
```

---

## PR 流程

1. Fork 仓库
2. 创建 feature 分支
3. 修改并测试
4. 提交 PR 到 main 分支
5. 等待 Review（通常 24-48 小时）

---

## 联系我们

- [Issues](https://github.com/kfat77/digital-nomad-cn/issues)
- [Discussions](https://github.com/kfat77/digital-nomad-cn/discussions)
