# 📊 Digital Nomad CN — Open Dataset

> **Single Source of Truth** — 所有数据的唯一真相源  
> **版本**: v2.0.0 ｜ **国家覆盖**: 100 ｜ **最后更新**: 2026-07-06  
> **许可证**: CC BY-SA 4.0

---

## 目录结构

```
datasets/
├── index.json              # 数据集总索引
├── countries.json          # 国家/地区数据 (100 国)
├── visa-official-links.json # 签证官方链接
├── _stats.json             # 统计信息 (自动生成)
└── _validation-report.json  # 校验报告 (自动生成)
```

## 数据 Schema

每个国家记录包含以下字段：

```json
{
  "id": "thailand",
  "iso": { "alpha2": "TH", "alpha3": "THA" },
  "name": { "zh": "泰国", "en": "Thailand" },
  "region": "southeast-asia",
  "coordinates": { "latitude": 15.87, "longitude": 100.9925 },
  "color": "#f59e0b",
  "info": { /* 签证、成本、网络等详细信息 */ },
  "status": "active",
  "metadata": {
    "version": "2.0.0",
    "lastUpdated": "2026-07-06T16:23:08.334Z",
    "dataQuality": { "completeness": 35, "accuracy": 60, "freshness": 50 }
  }
}
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 国家唯一标识符 |
| `iso.alpha2` | string | ✅ | ISO 3166-1 alpha-2 |
| `iso.alpha3` | string | ✅ | ISO 3166-1 alpha-3 |
| `name.zh` | string | ✅ | 中文名称 |
| `name.en` | string | ✅ | 英文名称 |
| `region` | string | ✅ | 地理区域 |
| `coordinates` | object | ✅ | 经纬度 |
| `color` | string | | 地图显示颜色 |
| `info` | object | | 详细信息（签证、成本、网络等） |
| `status` | string | ✅ | active/draft/deprecated |
| `metadata` | object | ✅ | 版本、更新时间、数据质量 |

---

## 区域分布

| 区域 | 国家数 |
|------|--------|
| 东南亚 (southeast-asia) | ~15 |
| 东亚 (east-asia) | ~10 |
| 西欧 (western-europe) | ~15 |
| 东欧 (eastern-europe) | ~10 |
| 北欧 (northern-europe) | ~8 |
| 南亚 (south-asia) | ~8 |
| 中东 (middle-east) | ~10 |
| 北美 (north-america) | ~5 |
| 中美 (central-america) | ~5 |
| 南美 (south-america) | ~5 |
| 非洲 (africa) | ~10 |
| 大洋洲 (oceania) | ~5 |

---

## 使用方式

### JavaScript / Node.js

```javascript
const countries = require('./countries.json');

// 查找特定国家
const thailand = countries.find(c => c.id === 'thailand');

// 按区域筛选
const seaCountries = countries.filter(c => c.region === 'southeast-asia');

// 按状态筛选
const activeCountries = countries.filter(c => c.status === 'active');
```

### Python

```python
import json

with open('countries.json', 'r', encoding='utf-8') as f:
    countries = json.load(f)

# 查找特定国家
thailand = next(c for c in countries if c['id'] == 'thailand')

# 按区域筛选
sea_countries = [c for c in countries if c['region'] == 'southeast-asia']
```

### R

```r
library(jsonlite)

countries <- fromJSON("countries.json")

# 筛选东南亚国家
sea <- countries[countries$region == "southeast-asia", ]
```

---

## 数据质量

当前数据质量概况（基于 metadata.dataQuality）：

| 维度 | 平均值 | 说明 |
|------|--------|------|
| 完整度 (completeness) | ~25% | 大部分国家仅有基础字段，info 详情待补充 |
| 准确度 (accuracy) | ~65% | 坐标、名称、ISO 代码等基础数据较可靠 |
| 新鲜度 (freshness) | ~60% | 需社区持续更新 |

> ⚠️ 数据持续完善中，欢迎通过 PR 贡献更新。

---

## 数据来源

`datasets/` 中的所有数据都来源于：
1. 从 `website/countries-data.js` 自动提取（V1 遗留数据）
2. World Bank Open Data（标准参考数据）
3. 社区贡献者通过 PR 提交（主要目标）

## 数据更新流程

```
1. 修改 datasets/*.json
2. 运行 npm run validate   # 校验数据
3. 运行 npm run sync:data  # 同步到 website/
4. 提交 PR
5. GitHub Actions 自动校验
6. 合并后自动部署
```

---

## 引用

如果你在自己的研究或项目中使用了本数据集，请引用：

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

## 许可证

- **数据**: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **代码**: [MIT](https://opensource.org/licenses/MIT)

---

## 贡献数据

详见项目根目录 [CONTRIBUTING.md](../CONTRIBUTING.md)
