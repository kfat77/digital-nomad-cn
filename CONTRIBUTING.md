# Contributing to Global Mobility Open Infrastructure

感谢您对 **Global Mobility Open Infrastructure** 项目的兴趣！

> **Data First · API First · AI First · Open Source First**
>
> 无论你是数据研究者、开发者、设计师，还是曾在某个国家生活过的数字游民，都可以为这个项目做出贡献。

---

## 快速开始（首次贡献者必读）

从未做过开源贡献？没关系！以下是最简单的贡献方式：

| 方式 | 难度 | 时间 | 说明 |
|------|------|------|------|
| **修正数据错误** | ⭐ | 5 分钟 | 发现某个国家的签证政策或生活成本数据过时？编辑 `datasets/countries.json` |
| **补充国家深度信息** | ⭐⭐ | 15 分钟 | 为你住过的国家补充 `info` 中的分类数据 |
| **报告问题** | ⭐ | 5 分钟 | 发现网站 bug 或数据错误？开一个新的 Issue |

### 首次贡献者 Step-by-Step

1. **Fork 仓库**：点击页面右上角的 "Fork" 按钮
2. **找到你想改的内容**：
   - 数据错误 → 编辑 `datasets/countries.json`
   - 新国家数据 → 在 `datasets/countries.json` 中添加
3. **校验数据**：运行 `npm run validate`
4. **同步到网站**：运行 `npm run sync:data`
5. **提交 PR**：编辑完成后点击 "Propose changes" → "Create pull request"
6. **等待 Review**：GitHub Actions 会自动校验你的数据

---

## V2 架构说明

### 数据是唯一的真相源

```
datasets/countries.json    ←── 你在这里修改数据
         │
         │ npm run sync:data
         ▼
website/countries-data.js  ←── 自动生成，禁止手动编辑
```

**重要规则**：
- 所有数据修改必须在 `datasets/` 目录进行
- `website/` 中的数据文件由脚本自动生成
- 提交 PR 时必须同时包含 `datasets/` 和 `website/` 的变更

### 数据校验

```bash
npm install
npm run validate        # 校验数据是否符合 Schema
npm run sync:data       # 同步到 website/
npm run build           # 完整构建
```

---

## 数据贡献

### 当前数据规模

| 数据类型 | 数量 | 状态 | 说明 |
|----------|------|------|------|
| 国家 | 61 | ✅ 结构化 | 符合 JSON Schema，CI 自动校验 |
| 城市 | 122 | 🚧 待迁移 | 将逐步迁移到 datasets/ |
| Schema | 1 | ✅ stable | country.schema.json |

### 数据结构

```json
{
  "id": "thailand",
  "iso": { "alpha2": "TH", "alpha3": "THA" },
  "name": { "zh": "泰国", "en": "Thailand" },
  "region": "southeast-asia",
  "coordinates": { "latitude": 15.87, "longitude": 100.9925 },
  "color": "#f59e0b",
  "info": {
    "visa": {
      "title": "签证",
      "items": [
        { "text": "旅游签证 - 60天免签", "url": null }
      ]
    }
  },
  "status": "active",
  "metadata": {
    "version": "2.0.0",
    "lastUpdated": "2026-07-07T00:00:00Z",
    "sources": []
  }
}
```

### 添加新国家

1. 在 `datasets/countries.json` 中添加新国家数据（参考现有格式）
2. 确保数据符合 `schemas/country.schema.json`
3. 运行 `npm run validate`
4. 运行 `npm run sync:data`
5. 提交 PR

### 数据更新

发现数据过时？
1. 编辑 `datasets/countries.json` 中对应国家的字段
2. 更新 `metadata.lastUpdated`
3. 添加数据来源到 `metadata.sources`
4. 运行 `npm run validate && npm run sync:data`
5. 提交 PR

---

## 提交规范

```
data: update Thailand visa policy (2026-07)
data: add Romania country data
feat: add new cost-of-living field
fix: correct Singapore safety index
schema: add city.schema.json
docs: update CONTRIBUTING.md
```

前缀说明：
- `data:` — 数据更新
- `schema:` — Schema 定义更新
- `feat:` — 新功能
- `fix:` — 修复错误
- `docs:` — 文档更新

---

## PR 流程

1. **Fork** 仓库并创建 feature 分支
2. **修改数据**：编辑 `datasets/countries.json`
3. **校验**：`npm run validate`
4. **同步**：`npm run sync:data`
5. **提交 PR** 到 `main` 分支
6. **CI 自动校验**：GitHub Actions 会运行 Schema 校验
7. **合并后**：你的名字会出现在 CONTRIBUTORS.md 中！

---

## 成为国家/城市维护者

如果你长期关注某个国家或城市的数据，可以申请成为维护者：

1. 在该国家的 Issue 中留言申请
2. 展示你的资质（居住经验、语言能力等）
3. 审核通过后获得 CODEOWNERS 权限
4. 负责审核该国家的数据 PR

---

## 联系我们

- **Issues**: [报告问题或建议](https://github.com/kfat77/digital-nomad-cn/issues)
- **Discussions**: [一般性讨论](https://github.com/kfat77/digital-nomad-cn/discussions)

**感谢你的贡献！每一行代码、每一条数据，都在帮助全球数字游民做出更好的决策。**
