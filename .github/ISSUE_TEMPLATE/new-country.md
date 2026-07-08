---
name: 🌍 新增国家/地区
about: 请求新增一个国家或地区的数据
title: '[NEW] 新增 {国家/地区名称}'
labels: ['new-country']
---

## 国家/地区信息

**中文名称：**
**英文名称：**
**ISO 代码（alpha-3）：**
**所属区域：** (east-asia / southeast-asia / western-europe 等)

## 数据准备情况

- [ ] 我已准备好基础数据（坐标、人口、货币等）
- [ ] 我已准备好签证数据
- [ ] 我已准备好生活成本参考
- [ ] 我有该国居住/旅行经验

## 为什么应该加入

(说明这个国家/地区对数字游民的重要性)

## 数据结构参考

```json
{
  "id": "country-slug",
  "iso": { "alpha2": "XX", "alpha3": "XXX" },
  "name": { "zh": "中文名", "en": "English Name" },
  "region": "region-name",
  "coordinates": { "latitude": 0, "longitude": 0 },
  "color": "#3b82f6",
  "status": "active",
  "metadata": {
    "version": "2.0.0",
    "lastUpdated": "2026-01-01T00:00:00Z"
  }
}
```
