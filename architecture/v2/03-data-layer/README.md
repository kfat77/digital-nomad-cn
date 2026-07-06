# 第三部分：数据层设计

## 核心原则

```
┌─────────────────────────────────────────────────────────────┐
│  1. 所有页面由数据自动生成                                   │
│  2. 数据是唯一的真相源 (Single Source of Truth)             │
│  3. 每个数据文件都有严格的JSON Schema校验                   │
│  4. 版本控制 = Git + Semantic Versioning                    │
│  5. 更新策略 = 社区PR + 自动校验 + 人工审核                 │
│  6. 索引系统 = 自动生成反向索引和搜索索引                   │
└─────────────────────────────────────────────────────────────┘
```

## 数据架构总览

```
schemas/
├── _meta/
│   ├── schema-version.json      # 全局Schema版本
│   ├── index.json               # 数据索引和反向索引
│   └── changelog.json           # 数据变更日志
│
├── core/                        # 核心实体（1:N关系的基础）
│   ├── country.schema.json      # 国家/地区定义
│   ├── city.schema.json         # 城市定义
│   └── region.schema.json       # 区域定义（大洲、联盟等）
│
├── mobility/                    # 流动性数据
│   ├── passport.schema.json     # 护照强度/免签
│   ├── visa.schema.json         # 签证类型与政策
│   ├── flight.schema.json       # 航线/机票数据
│   └── border.schema.json       # 边境/海关政策
│
├── living/                      # 生活成本数据
│   ├── cost.schema.json         # 生活成本指数
│   ├── salary.schema.json       # 薪资水平
│   ├── currency.schema.json     # 货币汇率
│   └── tax.schema.json          # 税务规则
│
├── infrastructure/              # 基础设施数据
│   ├── internet.schema.json     # 网络质量
│   ├── cowork.schema.json       # 联合办公空间
│   ├── coliving.schema.json     # 共居空间
│   ├── bank.schema.json         # 银行开户
│   └── insurance.schema.json    # 保险
│
├── quality/                     # 生活质量数据
│   ├── safety.schema.json       # 安全指数
│   ├── healthcare.schema.json   # 医疗体系
│   ├── education.schema.json    # 教育质量
│   └── weather.schema.json      # 气候数据
│
└── derived/                     # 派生数据（自动计算）
    ├── ranking.schema.json      # 综合排名
    ├── nomad-score.schema.json  # 数字游民评分
    └── comparison.schema.json   # 国家对比矩阵
```

---

## 数据关系图

```
┌─────────────┐
│   country   │◄──────────────────── 所有数据的核心锚点
│  (国家/地区) │
└──────┬──────┘
       │ 1:N
       ├────────► city (城市)
       ├────────► visa (签证政策)
       ├────────► tax (税务规则)
       ├────────► cost (生活成本)
       ├────────► internet (网络)
       ├────────► safety (安全)
       ├────────► healthcare (医疗)
       ├────────► weather (气候)
       ├────────► cowork (联合办公)
       ├────────► coliving (共居)
       └────────► ... (其他)

┌─────────────┐
│  passport   │◄──────────────────── 护照是跨国家的
│   (护照)     │
└──────┬──────┘
       │ N:M
       ├────────► country (免签/落地签/需签)
       └────────► visa (签证要求详情)

┌─────────────┐
│   region    │◄──────────────────── 区域聚合
│   (区域)     │
└──────┬──────┘
       │ 1:N
       └────────► country (国家属于区域)
```

---

## Schema 设计规范

### 每个Schema必须包含

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://github.com/kfat77/digital-nomad-cn/schemas/v2/country.schema.json",
  "title": "Country",
  "description": "国家/地区基础信息定义",
  "version": "2.0.0",
  "lastUpdated": "2026-07-07",
  
  "definitions": { /* 可复用定义 */ },
  
  "type": "object",
  "required": ["id", "name", "status"],
  "properties": { /* 字段定义 */ }
}
```

### 字段命名规范

| 规范 | 说明 | 示例 |
|------|------|------|
| ID | 小写ISO代码或slug | `"id": "thailand"` |
| 名称 | 多语言对象 | `"name": { "zh": "泰国", "en": "Thailand" }` |
| 时间 | ISO 8601 | `"lastUpdated": "2026-07-07T00:00:00Z"` |
| 货币 | 金额+货币代码 | `"amount": 15000, "currency": "THB"` |
| 评分 | 0-100 整数 | `"score": 85` |
| 状态 | 枚举字符串 | `"status": "active"` |

### 版本控制策略

```
数据版本 = Semantic Versioning
├── MAJOR: Schema结构变更（不兼容）
├── MINOR: 新增字段（兼容）
└── PATCH: 数据修正（兼容）

示例:
  v1.0.0 → 初始发布
  v1.1.0 → 新增"digitalNomadVisa"字段
  v1.1.1 → 修正泰国生活成本数据
  v2.0.0 → 重构cost结构（不兼容变更）
```

### 更新策略

```
┌─────────────────────────────────────────┐
│           数据更新流程                   │
│                                         │
│  1. 贡献者提交PR（修改JSON数据）         │
│     ├─ 触发 GitHub Actions              │
│     ├─ 自动运行 Schema 校验              │
│     ├─ 自动运行 数据完整性检查            │
│     └─ 生成 变更报告                     │
│                                         │
│  2. 维护者审核                          │
│     ├─ 检查数据来源可靠性                │
│     ├─ 检查是否有争议性内容              │
│     └─ 确认变更报告                      │
│                                         │
│  3. 合并后自动触发                       │
│     ├─ 更新索引 (index.json)            │
│     ├─ 生成派生数据 (rankings等)        │
│     ├─ 更新API缓存                      │
│     ├─ 发布GitHub Release               │
│     └─ 通知订阅的Webhook                │
└─────────────────────────────────────────┘
```

---

## Schema 文件列表

| # | Schema | 文件 | 说明 |
|---|--------|------|------|
| 1 | country | 国家/地区 | 核心实体，所有数据的锚点 |
| 2 | city | 城市 | 数字游民城市数据 |
| 3 | visa | 签证 | 签证类型、要求、流程 |
| 4 | passport | 护照 | 护照免签强度 |
| 5 | tax | 税务 | 税务居民规则、税率 |
| 6 | cost | 生活成本 | 租金、餐饮、交通等 |
| 7 | cowork | 联合办公 | 共享办公空间 |
| 8 | coliving | 共居 | 共居空间 |
| 9 | weather | 气候 | 温度、湿度、季节 |
| 10 | internet | 网络 | 速度、稳定性、价格 |
| 11 | salary | 薪资 | 本地薪资水平 |
| 12 | safety | 安全 | 安全指数、犯罪率 |
| 13 | healthcare | 医疗 | 医疗体系、保险 |
| 14 | education | 教育 | 教育质量（带子女适用）|
| 15 | currency | 货币 | 汇率、货币政策 |
| 16 | bank | 银行 | 开户要求、手续费 |
| 17 | flight | 航班 | 航线、价格、时长 |
| 18 | insurance | 保险 | 旅行保险、医疗保险 |

---

## 自动校验规则

```yaml
validation:
  # 每个数据文件必须通过的校验
  required:
    - schema_valid: 必须符合对应JSON Schema
    - id_unique: ID不能重复
    - reference_integrity: 外键引用必须存在
    - required_fields: 必填字段不能缺失
    - date_format: 日期格式正确
    - url_valid: URL必须可访问（抽查）
  
  # 数据质量校验
  quality:
    - no_placeholder: 不能有TODO/placeholder内容
    - source_attribution: 数据必须有来源标注
    - update_freshness: 数据更新时间不能超过1年
    - numeric_range: 数值必须在合理范围内
    - cross_consistency: 跨文件数据一致性
  
  # 生成校验报告
  output:
    - validation_report.json
    - error_details.json
    - coverage_report.json
```
