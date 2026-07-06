# Datasets

> **Single Source of Truth** — 所有数据的唯一真相源

## 目录结构

```
datasets/
├── index.json              # 数据集总索引（本目录的入口）
├── countries.json          # 国家/地区数据
├── visa-official-links.json # 签证官方链接
├── _stats.json             # 统计信息（自动生成）
└── _validation-report.json  # 校验报告（自动生成）
```

## 数据来源

`datasets/` 中的所有数据都来源于：
1. 从 `website/countries-data.js` 自动提取（当前阶段）
2. 社区贡献者通过 PR 提交（目标）

## 数据更新流程

```
1. 修改 datasets/*.json
2. 运行 npm run validate   # 校验数据
3. 运行 npm run sync:data  # 同步到 website/
4. 提交 PR
5. GitHub Actions 自动校验
6. 合并后自动部署
```

## 贡献数据

详见项目根目录 [CONTRIBUTING.md](../CONTRIBUTING.md)
