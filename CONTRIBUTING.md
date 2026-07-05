# Contributing to Global Mobility Infrastructure

感谢您对 Global Mobility Infrastructure 项目的兴趣！本指南将帮助您快速参与贡献。

## 目录

- [数据贡献](#数据贡献)
- [代码贡献](#代码贡献)
- [提交规范](#提交规范)
- [PR 流程](#pr-流程)

---

## 数据贡献

### 添加新国家

1. 复制模板文件创建新国家 JSON
2. 按照 `website/data/schemas/country-detail.json` 填写数据
3. 在 `website/scripts/generate-country-pages.py` 的 `COST_ESTIMATES` 中添加成本估算
4. 运行生成器生成页面
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

### 数据更新

发现数据过时？直接编辑对应的 JSON 文件并提交 PR。

---

## 代码贡献

### 生成器改进

`website/scripts/generate-country-pages.py` 是核心生成器，支持：
- 国家页面生成
- 相似度计算
- 成本估算内联

### 页面模板

`website/scripts/country-template.html` 使用 `{{placeholder}}` 替换机制。

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
