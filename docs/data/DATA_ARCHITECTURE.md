# Global Mobility Infrastructure — Data Architecture

## 1. Country Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "country",
  "type": "object",
  "required": ["id", "name", "name_en", "code_iso_3166_1", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan" },
    "name": { "type": "string", "example": "日本" },
    "name_en": { "type": "string", "example": "Japan" },
    "name_local": { "type": "string", "example": "日本" },
    "code_iso_3166_1": { "type": "string", "pattern": "^[A-Z]{2}$" },
    "code_iso_3166_3": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "code_un_m49": { "type": "integer", "example": 392 },
    "region": { "type": "string", "enum": ["asia", "oceania", "europe", "americas_north", "americas_south", "africa", "middle_east"] },
    "sub_region": { "type": "string", "example": "east_asia" },
    "is_special_admin_region": { "type": "boolean" },
    "is_tax_haven": { "type": "boolean" },
    "is_digital_nomad_friendly": { "type": "boolean" },
    "has_digital_nomad_visa": { "type": "boolean" },
    "coordinates": {
      "type": "object",
      "properties": {
        "lat": { "type": "number", "minimum": -90, "maximum": 90 },
        "lon": { "type": "number", "minimum": -180, "maximum": 180 }
      }
    },
    "timezone": { "type": "array", "items": { "type": "string" } },
    "currency": { "type": "array", "items": { "type": "object", "properties": { "code": { "type": "string" }, "name": { "type": "string" }, "is_primary": { "type": "boolean" } } } },
    "languages": { "type": "array", "items": { "type": "object", "properties": { "code": { "type": "string" }, "name": { "type": "string" }, "is_official": { "type": "boolean" } } } },
    "capital_city_id": { "type": "string", "description": "关联 city.json" },
    "population": { "type": "integer" },
    "area_km2": { "type": "integer" },
    "gdp_per_capita_usd": { "type": "number" },
    "hdi": { "type": "number", "minimum": 0, "maximum": 1 },
    "safety_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "freedom_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "internet_quality_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "political_stability": { "type": "string", "enum": ["stable", "moderate", "unstable", "volatile"] },
    "driving_side": { "type": "string", "enum": ["left", "right"] },
    "plug_type": { "type": "array", "items": { "type": "string" } },
    "voltage": { "type": "array", "items": { "type": "integer" } },
    "emergency_number": { "type": "string" },
    "water_drinkability": { "type": "string", "enum": ["safe", "treatable", "unsafe"] },
    "has_crs": { "type": "boolean" },
    "china_passport_visa_status": { "type": "string", "enum": ["visa_free", "visa_on_arrival", "evisa", "visa_required", "eta"] },
    "china_passport_visa_duration_days": { "type": "integer" },
    "china_passport_visa_note": { "type": "string" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "score_overall": { "type": "number", "minimum": 0, "maximum": 100 },
    "status": { "type": "string", "enum": ["published", "draft", "archived"], "default": "draft" },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "last_verified_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| 1:N | city.json | 归属 | 一个国家包含多个城市 |
| 1:N | visa.json | 归属 | 一个国家提供多种签证 |
| 1:N | tax.json | 归属 | 一个国家对应一种税制 |
| 1:N | internet.json | 归属 | 一个国家对应一种网络环境 |
| N:M | passport.json | 免签 | 护照与国家的免签关系 |
| 1:N | healthcare.json | 归属 | 一个国家的医疗体系 |
| 1:N | education.json | 归属 | 一个国家的教育体系 |
| 1:N | cowork.json | 归属 | 一个国家的共享办公空间 |
| 1:N | cost.json | 归属 | 一个国家的消费水平 |
| 1:N | salary.json | 归属 | 一个国家的薪资水平 |
| 1:N | weather.json | 归属 | 一个国家的天气数据 |
| 1:N | flight.json | 出发/到达 | 航班的起点或终点 |
| 1:N | remote-job.json | 归属 | 远程工作机会所属国家 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| 社区 PR | 按需 | 基础信息（语言、货币、人口等）通过社区贡献更新 |
| API 同步 | 月度 | HDI、GDP、安全指数等来自 World Bank/UN API |
| 自动化 | 实时 | 中国护照免签状态来自外交部/维基百科动态更新 |
| 人工审核 | 季度 | 政治稳定性、CRS参与等需专家验证 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| World Bank Open Data | API | HDI、GDP、人口 |
| ISO 3166 | 标准 | 国家代码 |
| 中国外交部 | 官方 | 免签政策 |
| Numbeo | 爬虫 | 安全指数、生活成本 |
| 社区贡献 | UGC | 实际体验、细节修正 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/countries | 列表 | 支持过滤、排序、分页 |
| GET /api/v1/countries/{id} | 详情 | 单国家完整数据 |
| GET /api/v1/countries/{id}/related | 关联 | 返回该国的签证、城市、成本等 |
| POST /api/v1/countries/{id}/report | 纠错 | 用户提交数据纠错 |
| GET /api/v1/countries/compare | 对比 | 多国家横向对比（最多3个） |
| GET /api/v1/countries/search | 搜索 | 全文搜索，支持多语言 |
| GET /api/v1/countries/nearby | 邻近 | 基于坐标的邻近国家推荐 |
| GET /api/v1/countries/by-passport/{passport_id} | 免签 | 某护照可免签的所有国家 |
| GET /api/v1/countries/recommend | 推荐 | 基于用户画像的智能推荐 |

---

## 2. Visa Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "visa",
  "type": "object",
  "required": ["id", "country_id", "type", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan-tourist-visa" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "name": { "type": "string", "example": "日本旅游签证" },
    "name_en": { "type": "string", "example": "Japan Tourist Visa" },
    "type": { "type": "string", "enum": ["tourist", "work", "student", "digital_nomad", "business", "investment", "family", "transit", "whv", "permanent_resident", "citizenship", "retirement", "medical", "cultural"], "description": "签证类型" },
    "sub_type": { "type": "string", "description": "子类型，如 'single', 'multiple', 'express'" },
    "target_nationality": { "type": "string", "description": "面向国籍，如 'CHN' 表示中国公民" },
    "is_china_specific": { "type": "boolean", "description": "是否专为中国护照设计" },
    "eligibility": {
      "type": "object",
      "description": "申请条件",
      "properties": {
        "min_age": { "type": "integer" },
        "max_age": { "type": "integer" },
        "min_income_usd": { "type": "number" },
        "min_bank_balance_usd": { "type": "number" },
        "education_level": { "type": "string", "enum": ["none", "high_school", "bachelor", "master", "phd"] },
        "work_experience_years": { "type": "integer" },
        "language_requirements": { "type": "array", "items": { "type": "object", "properties": { "language": { "type": "string" }, "level": { "type": "string", "enum": ["basic", "intermediate", "advanced", "native"] }, "test": { "type": "string" }, "min_score": { "type": "string" } } } },
        "health_check": { "type": "boolean" },
        "criminal_record_check": { "type": "boolean" },
        "sponsor_required": { "type": "boolean" },
        "investment_required_usd": { "type": "number" },
        "specific_professions": { "type": "array", "items": { "type": "string" } },
        "other_requirements": { "type": "array", "items": { "type": "string" } }
      }
    },
    "duration": {
      "type": "object",
      "description": "停留时长",
      "properties": {
        "max_stay_days": { "type": "integer" },
        "validity_months": { "type": "integer" },
        "extension_allowed": { "type": "boolean" },
        "extension_max_days": { "type": "integer" }
      }
    },
    "process": {
      "type": "object",
      "description": "申请流程",
      "properties": {
        "application_method": { "type": "string", "enum": ["online", "embassy", "consulate", "visa_center", "e-visa", "on_arrival", "agent"] },
        "processing_time_days": { "type": "integer" },
        "processing_time_note": { "type": "string" },
        "steps": { "type": "array", "items": { "type": "object", "properties": { "step_number": { "type": "integer" }, "title": { "type": "string" }, "description": { "type": "string" }, "estimated_time": { "type": "string" }, "required_documents": { "type": "array", "items": { "type": "string" } } } } },
        "appointment_required": { "type": "boolean" },
        "interview_required": { "type": "boolean" },
        "biometrics_required": { "type": "boolean" }
      }
    },
    "cost": {
      "type": "object",
      "description": "费用",
      "properties": {
        "visa_fee_usd": { "type": "number" },
        "service_fee_usd": { "type": "number" },
        "express_fee_usd": { "type": "number" },
        "health_insurance_required": { "type": "boolean" },
        "health_insurance_min_coverage_usd": { "type": "number" },
        "total_estimated_usd": { "type": "number" }
      }
    },
    "documents": {
      "type": "object",
      "description": "材料清单",
      "properties": {
        "required": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "description": { "type": "string" }, "is_original": { "type": "boolean" }, "copies_needed": { "type": "integer" }, "notarization_required": { "type": "boolean" }, "translation_required": { "type": "boolean" } } } },
        "optional": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "description": { "type": "string" } } } }
      }
    },
    "renewal": {
      "type": "object",
      "description": "续签",
      "properties": {
        "renewable": { "type": "boolean" },
        "renewal_pattern": { "type": "string", "example": "3+3+2" },
        "renewal_conditions": { "type": "array", "items": { "type": "string" } },
        "max_total_duration_years": { "type": "integer" },
        "path_to_permanent": { "type": "boolean" },
        "path_to_citizenship": { "type": "boolean" }
      }
    },
    "success_rate": {
      "type": "object",
      "description": "成功率",
      "properties": {
        "overall_percent": { "type": "number", "minimum": 0, "maximum": 100 },
        "china_specific_percent": { "type": "number", "minimum": 0, "maximum": 100 },
        "sample_size": { "type": "integer" },
        "data_source": { "type": "string" }
      }
    },
    "official_links": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "url": { "type": "string", "format": "uri" }, "language": { "type": "string" } } } },
    "tips": { "type": "array", "items": { "type": "string" }, "description": "申请技巧" },
    "common_rejection_reasons": { "type": "array", "items": { "type": "string" } },
    "status": { "type": "string", "enum": ["published", "draft", "archived", "deprecated"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "last_verified_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 每个签证属于一个国家 |
| 1:N | cost.json | 参考 | 签证费用参考当地物价 |
| 1:N | flight.json | 参考 | 签证获批后可能的航班 |
| N:M | passport.json | 适用 | 某护照适用的签证列表 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| 社区 PR | 按需 | 流程、材料、技巧等经验型内容 |
| 官方同步 | 月度 | 费用、处理时间、政策变动来自官方渠道 |
| 自动化 | 实时 | 成功率数据来自社区统计 |
| 人工审核 | 季度 | 续签条件、政策变动需专家验证 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| 各国移民局官网 | 官方 | 政策、费用、材料清单 |
| 中国签证中心 | 官方 | 中国护照申请具体要求 |
| 社区经验 | UGC | 实际申请流程、时间线、避坑 |
| 移民律师 | 专家 | 政策解读、法律风险 |
| 小红书/知乎 | 爬虫 | 成功率、拒签原因 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/visas | 列表 | 按国家、类型、难度过滤 |
| GET /api/v1/visas/{id} | 详情 | 完整签证攻略 |
| POST /api/v1/visas/eligibility-check | 评估 | 输入个人条件，返回可申请的签证列表 |
| GET /api/v1/visas/compare | 对比 | 多签证横向对比 |
| GET /api/v1/visas/timeline/{id} | 时间线 | 典型申请时间线（社区真实案例） |
| GET /api/v1/visas/recent-policy-changes | 变动 | 近期政策变动汇总 |
| POST /api/v1/visas/{id}/experience | 提交 | 用户提交申请经验 |
| GET /api/v1/visas/{id}/experiences | 查看 | 社区申请经验列表 |

---

## 3. City Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "city",
  "type": "object",
  "required": ["id", "country_id", "name", "name_en", "status"],
  "properties": {
    "id": { "type": "string", "example": "tokyo" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "name": { "type": "string", "example": "东京" },
    "name_en": { "type": "string", "example": "Tokyo" },
    "name_local": { "type": "string", "example": "東京" },
    "is_capital": { "type": "boolean" },
    "coordinates": {
      "type": "object",
      "properties": {
        "lat": { "type": "number", "minimum": -90, "maximum": 90 },
        "lon": { "type": "number", "minimum": -180, "maximum": 180 }
      }
    },
    "timezone": { "type": "string", "description": "IANA timezone" },
    "population": { "type": "integer" },
    "area_km2": { "type": "integer" },
    "elevation_m": { "type": "integer" },
    "climate_type": { "type": "string", "enum": ["tropical", "subtropical", "temperate", "continental", "polar", "arid", "mediterranean", "oceanic"] },
    "cost_of_living_index": { "type": "number", "description": "Numbeo 生活成本指数" },
    "rent_index": { "type": "number", "description": "租房指数" },
    "groceries_index": { "type": "number", "description": "食品指数" },
    "restaurant_index": { "type": "number", "description": "餐厅指数" },
    "safety_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "pollution_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "traffic_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "health_care_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "internet_speed_avg_mbps": { "type": "number" },
    "internet_speed_mobile_avg_mbps": { "type": "number" },
    "is_digital_nomad_hub": { "type": "boolean", "description": "是否为数字游民热门城市" },
    "nomad_score": { "type": "number", "minimum": 0, "maximum": 100, "description": "数字游民综合评分" },
    "walkability_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "public_transport_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "bike_friendly": { "type": "boolean" },
    "english_speaking_level": { "type": "string", "enum": ["widespread", "common", "moderate", "limited", "rare"] },
    "expat_community_size": { "type": "string", "enum": ["large", "medium", "small", "tiny"] },
    "nightlife_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "tags": { "type": "array", "items": { "type": "string" }, "description": "标签，如 ['startup_hub', 'beach_city', 'ski_resort']" },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 城市属于国家 |
| 1:N | cowork.json | 包含 | 城市内有多个共享办公空间 |
| 1:N | cost.json | 参考 | 城市级别的消费数据 |
| 1:N | weather.json | 参考 | 城市的天气数据 |
| 1:N | salary.json | 参考 | 城市的薪资水平 |
| 1:N | healthcare.json | 参考 | 城市的医疗资源 |
| 1:N | education.json | 参考 | 城市的教育资源 |
| 1:N | flight.json | 出发/到达 | 航班的城市端点 |
| N:M | remote-job.json | 关联 | 远程工作机会对应的城市 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 月度 | 人口、面积、GDP等基础数据 |
| 社区 PR | 按需 | 数字游民评分、体验标签 |
| 自动化 | 季度 | 生活成本指数、网速等来自第三方API |
| 人工审核 | 季度 | 安全指数、污染指数等需验证 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| Numbeo | API | 生活成本、安全、污染指数 |
| OpenStreetMap | API | 坐标、面积、城市边界 |
| Speedtest.net | API | 网速数据 |
| 社区贡献 | UGC | 数字游民体验、标签 |
| 当地政府 | 官方 | 人口、GDP |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/cities | 列表 | 按国家、成本、安全指数过滤 |
| GET /api/v1/cities/{id} | 详情 | 城市完整数据 |
| GET /api/v1/cities/{id}/nearby | 邻近 | 周边城市推荐 |
| GET /api/v1/cities/compare | 对比 | 城市横向对比 |
| GET /api/v1/cities/nomadic-ranking | 排名 | 数字游民城市排名 |
| GET /api/v1/cities/by-budget | 预算匹配 | 输入预算，推荐匹配城市 |
| POST /api/v1/cities/{id}/rating | 评分 | 用户提交城市评分 |
| GET /api/v1/cities/trending | 趋势 | 近期热门城市 |

---

## 4. Cowork Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "cowork",
  "type": "object",
  "required": ["id", "city_id", "name", "status"],
  "properties": {
    "id": { "type": "string", "example": "tokyo-we-work-shibuya" },
    "city_id": { "type": "string", "description": "关联 city.json" },
    "country_id": { "type": "string", "description": "冗余：关联 country.json" },
    "name": { "type": "string", "example": "WeWork 涩谷" },
    "name_en": { "type": "string" },
    "brand": { "type": "string", "example": "WeWork" },
    "coordinates": {
      "type": "object",
      "properties": {
        "lat": { "type": "number" },
        "lon": { "type": "number" }
      }
    },
    "address": { "type": "string" },
    "address_local": { "type": "string" },
    "phone": { "type": "string" },
    "website": { "type": "string", "format": "uri" },
    "is_chain": { "type": "boolean" },
    "space_type": { "type": "string", "enum": ["coworking", "cafe", "library", "hotel_lounge", "incubator", "accelerator", "community_space"] },
    "pricing": {
      "type": "object",
      "properties": {
        "currency": { "type": "string" },
        "day_pass": { "type": "number" },
        "week_pass": { "type": "number" },
        "month_hot_desk": { "type": "number" },
        "month_dedicated": { "type": "number" },
        "month_private_office": { "type": "number" },
        "meeting_room_per_hour": { "type": "number" },
        "has_free_trial": { "type": "boolean" },
        "deposit_required": { "type": "boolean" },
        "deposit_amount": { "type": "number" }
      }
    },
    "amenities": { "type": "array", "items": { "type": "string", "enum": ["wifi", "power_outlets", "coffee", "tea", "snacks", "printer", "scanner", "meeting_rooms", "phone_booths", "lockers", "shower", "bike_storage", "kitchen", "24_7", "pet_friendly", "outdoor_space", "event_space", "nap_room", "gym", "pool"] } },
    "internet_speed_mbps": { "type": "number" },
    "has_fiber": { "type": "boolean" },
    "noise_level": { "type": "string", "enum": ["quiet", "moderate", "lively", "loud"] },
    "atmosphere": { "type": "string", "enum": ["professional", "casual", "creative", "startup", "corporate", "community"] },
    "community_size": { "type": "string", "enum": ["large", "medium", "small", "intimate"] },
    "languages_spoken": { "type": "array", "items": { "type": "string" } },
    "hours": {
      "type": "object",
      "properties": {
        "monday": { "type": "string", "example": "09:00-18:00" },
        "tuesday": { "type": "string" },
        "wednesday": { "type": "string" },
        "thursday": { "type": "string" },
        "friday": { "type": "string" },
        "saturday": { "type": "string" },
        "sunday": { "type": "string" }
      }
    },
    "is_24_7": { "type": "boolean" },
    "parking_available": { "type": "boolean" },
    "accessible": { "type": "boolean", "description": "无障碍设施" },
    "rating": { "type": "number", "minimum": 0, "maximum": 5 },
    "review_count": { "type": "integer" },
    "photos": { "type": "array", "items": { "type": "string", "format": "uri" } },
    "status": { "type": "string", "enum": ["published", "draft", "archived", "closed"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | city.json | 归属 | 共享办公空间属于城市 |
| N:1 | country.json | 归属 | 冗余关联 |
| 1:N | internet.json | 参考 | 网络环境数据 |
| N:M | remote-job.json | 关联 | 远程工作者常用的空间 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| 社区 PR | 按需 | 新开/关闭的空间、价格变动 |
| 自动化 | 月度 | 从Google Maps/官网抓取基础信息 |
| 人工审核 | 季度 | 评分、网络速度验证 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| Google Maps | API | 地址、坐标、营业时间 |
| 品牌官网 | 爬虫 | 价格、设施、图片 |
| 社区贡献 | UGC | 实际体验、网速、氛围 |
| 品牌方 | 官方 | 准确的价格和政策 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/coworks | 列表 | 按城市、价格、设施过滤 |
| GET /api/v1/coworks/{id} | 详情 | 完整空间信息 |
| GET /api/v1/coworks/nearby | 附近 | 基于坐标的附近空间 |
| POST /api/v1/coworks/{id}/review | 评价 | 用户提交评价 |
| GET /api/v1/coworks/{id}/reviews | 查看 | 评价列表 |
| GET /api/v1/coworks/compare | 对比 | 多空间对比 |
| GET /api/v1/coworks/by-amenity | 设施 | 按设施过滤（如需会议室） |

---

## 5. Tax Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "tax",
  "type": "object",
  "required": ["id", "country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan-tax-2026" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "year": { "type": "integer", "description": "税务年度" },
    "system_type": { "type": "string", "enum": ["residence_based", "citizenship_based", "territorial", "zero_tax", "flat_tax"] },
    "is_citizenship_taxed": { "type": "boolean", "description": "是否全球征税（如美国）" },
    "personal_income_tax": {
      "type": "object",
      "properties": {
        "is_progressive": { "type": "boolean" },
        "min_rate": { "type": "number", "minimum": 0, "maximum": 100 },
        "max_rate": { "type": "number", "minimum": 0, "maximum": 100 },
        "brackets": { "type": "array", "items": { "type": "object", "properties": { "min_income_usd": { "type": "number" }, "max_income_usd": { "type": "number" }, "rate": { "type": "number" } } } },
        "standard_deduction_usd": { "type": "number" },
        "tax_free_threshold_usd": { "type": "number" }
      }
    },
    "corporate_tax_rate": { "type": "number", "minimum": 0, "maximum": 100 },
    "capital_gains_tax": {
      "type": "object",
      "properties": {
        "rate": { "type": "number", "minimum": 0, "maximum": 100 },
        "is_progressive": { "type": "boolean" },
        "holding_period_discount_years": { "type": "integer" },
        "exemption_usd": { "type": "number" }
      }
    },
    "dividend_tax_rate": { "type": "number", "minimum": 0, "maximum": 100 },
    "interest_tax_rate": { "type": "number", "minimum": 0, "maximum": 100 },
    "wealth_tax": {
      "type": "object",
      "properties": {
        "exists": { "type": "boolean" },
        "rate": { "type": "number" },
        "threshold_usd": { "type": "number" }
      }
    },
    "inheritance_tax": {
      "type": "object",
      "properties": {
        "exists": { "type": "boolean" },
        "rate": { "type": "number" },
        "threshold_usd": { "type": "number" }
      }
    },
    "vat_gst_rate": { "type": "number", "minimum": 0, "maximum": 100 },
    "tax_treaties": { "type": "array", "items": { "type": "object", "properties": { "country_code": { "type": "string" }, "treaty_name": { "type": "string" }, "benefits": { "type": "array", "items": { "type": "string" } } } },
    "tax_residency_rules": { "type": "string", "description": "税收居民判定规则" },
    "days_to_trigger_residency": { "type": "integer", "description": "触发税收居民身份的天数" },
    "exit_tax": { "type": "boolean", "description": "是否有离境税" },
    "crs_participation": { "type": "boolean", "description": "是否参与CRS" },
    "fatca_participation": { "type": "boolean", "description": "是否参与FATCA" },
    "special_tax_regimes": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "description": { "type": "string" }, "eligibility": { "type": "string" }, "benefits": { "type": "array", "items": { "type": "string" } } } },
    "tax_filing_deadline": { "type": "string", "description": "报税截止日期" },
    "tax_payment_methods": { "type": "array", "items": { "type": "string" } },
    "tax_advisor_recommendation": { "type": "string", "description": "是否建议聘请税务顾问" },
    "disclaimer": { "type": "string", "description": "法律免责声明" },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 税制属于国家 |
| 1:N | cost.json | 参考 | 税务成本参考 |
| N:M | visa.json | 参考 | 特定签证对应的税务影响 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| 专家 PR | 年度 | 税率、法规变动需税务专家验证 |
| 官方同步 | 年度 | 税率来自政府预算公告 |
| 自动化 | 实时 | CRS/FATCA参与状态来自官方数据库 |
| 人工审核 | 季度 | 特殊税收制度的适用条件 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| OECD Tax Database | 官方 | 税率、税级 |
| PwC Tax Summaries | 专家 | 综合税务概览 |
| 各国税务局 | 官方 | 准确的税率和法规 |
| 税务律师 | 专家 | 特殊制度的解读 |
| 社区贡献 | UGC | 实际报税经验 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/tax/{country_id} | 详情 | 某国税制完整信息 |
| POST /api/v1/tax/calculator | 计算器 | 输入收入，估算税负 |
| GET /api/v1/tax/compare | 对比 | 多国税负对比 |
| GET /api/v1/tax/optimization | 优化 | 基于用户情况的税务优化建议 |
| GET /api/v1/tax/treaties | 协定 | 某国与中国/其他国家的税收协定 |
| POST /api/v1/tax/residency-check | 居民判定 | 输入停留天数，判断是否触发税收居民 |

---

## 6. Internet Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "internet",
  "type": "object",
  "required": ["id", "country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan-internet" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "city_id": { "type": "string", "description": "可选：关联 city.json" },
    "avg_download_speed_mbps": { "type": "number" },
    "avg_upload_speed_mbps": { "type": "number" },
    "mobile_download_speed_mbps": { "type": "number" },
    "mobile_upload_speed_mbps": { "type": "number" },
    "fixed_broadband_penetration": { "type": "number", "minimum": 0, "maximum": 100 },
    "mobile_broadband_penetration": { "type": "number", "minimum": 0, "maximum": 100 },
    "avg_monthly_cost_usd": { "type": "number", "description": "宽带月均费用" },
    "mobile_data_cost_per_gb_usd": { "type": "number" },
    "isps": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "website": { "type": "string" }, "avg_speed_mbps": { "type": "number" }, "price_range_usd": { "type": "string" }, "contract_required": { "type": "boolean" }, "english_support": { "type": "boolean" } } } },
    "mobile_operators": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "prepaid_plans": { "type": "array", "items": { "type": "object", "properties": { "data_gb": { "type": "integer" }, "validity_days": { "type": "integer" }, "price_usd": { "type": "number" } } } } } },
    "censorship_level": { "type": "string", "enum": ["none", "low", "moderate", "high", "severe"], "description": "审查级别" },
    "blocked_services": { "type": "array", "items": { "type": "string" }, "description": "被屏蔽的服务，如 ['google', 'youtube', 'twitter']" },
    "vpn_required": { "type": "boolean", "description": "是否需要VPN" },
    "vpn_legality": { "type": "string", "enum": ["legal", "grey", "illegal", "heavily_restricted"] },
    "public_wifi_availability": { "type": "string", "enum": ["widespread", "common", "limited", "rare"] },
    "public_wifi_quality": { "type": "string", "enum": ["excellent", "good", "fair", "poor"] },
    "coworking_wifi_quality": { "type": "string", "enum": ["excellent", "good", "fair", "poor"] },
    "starlink_available": { "type": "boolean" },
    "5g_coverage": { "type": "string", "enum": ["widespread", "urban_only", "limited", "none"] },
    "ipv6_adoption": { "type": "number", "minimum": 0, "maximum": 100 },
    "cybersecurity_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "net_neutrality": { "type": "string", "enum": ["strong", "moderate", "weak", "none"] },
    "data_privacy_laws": { "type": "string", "enum": ["strong", "moderate", "weak", "none"] },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 网络环境属于国家 |
| N:1 | city.json | 归属 | 可选：城市级网络数据 |
| 1:N | cowork.json | 参考 | 共享办公空间的网络质量 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 月度 | 网速、覆盖率来自 Speedtest/Ookla |
| 社区 PR | 按需 | 审查级别、VPN需求、被屏蔽服务 |
| 自动化 | 季度 | 5G覆盖、Starlink可用性 |
| 人工审核 | 季度 | 审查级别、VPN合法性验证 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| Speedtest.net | API | 网速数据 |
| Ookla | API | 网速排名 |
| Freedom House | 官方 | 网络自由指数 |
| GreatFire.org | 社区 | 中国审查数据 |
| 社区贡献 | UGC | 实际网速、VPN体验 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/internet/{country_id} | 详情 | 网络环境完整信息 |
| GET /api/v1/internet/speed-ranking | 排名 | 全球网速排名 |
| GET /api/v1/internet/censorship-map | 审查地图 | 审查级别可视化 |
| GET /api/v1/internet/vpn-recommendations | VPN推荐 | 基于国家的VPN推荐 |
| POST /api/v1/internet/speed-test | 测速 | 用户提交测速数据 |
| GET /api/v1/internet/connectivity-score | 连通性 | 综合连通性评分 |

---

## 7. Weather Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "weather",
  "type": "object",
  "required": ["id", "city_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "tokyo-weather-annual" },
    "city_id": { "type": "string", "description": "关联 city.json" },
    "country_id": { "type": "string", "description": "冗余：关联 country.json" },
    "climate_zone": { "type": "string", "enum": ["tropical", "subtropical", "temperate", "continental", "polar", "arid", "mediterranean", "oceanic", "monsoon"] },
    "best_months_to_visit": { "type": "array", "items": { "type": "integer", "minimum": 1, "maximum": 12 } },
    "worst_months_to_visit": { "type": "array", "items": { "type": "integer", "minimum": 1, "maximum": 12 } },
    "monthly_data": { "type": "array", "items": { "type": "object", "properties": { "month": { "type": "integer", "minimum": 1, "maximum": 12 }, "avg_high_c": { "type": "number" }, "avg_low_c": { "type": "number" }, "avg_temp_c": { "type": "number" }, "rainfall_mm": { "type": "number" }, "rainy_days": { "type": "integer" }, "humidity_percent": { "type": "integer", "minimum": 0, "maximum": 100 }, "sunshine_hours": { "type": "number" }, "uv_index": { "type": "integer", "minimum": 0, "maximum": 11 }, "snow_days": { "type": "integer" }, "seawater_temp_c": { "type": "number" } } } },
    "air_quality_index_avg": { "type": "integer", "minimum": 0, "maximum": 500 },
    "air_quality_seasonal": { "type": "string", "enum": ["good", "moderate", "poor", "very_poor", "variable"] },
    "common_natural_disasters": { "type": "array", "items": { "type": "string", "enum": ["earthquake", "typhoon", "flood", "drought", "wildfire", "tornado", "hurricane", "tsunami", "volcanic_eruption", "heatwave", "cold_wave"] } },
    "seasonal_notes": { "type": "string", "description": "季节性注意事项" },
    "clothing_recommendations": { "type": "array", "items": { "type": "object", "properties": { "season": { "type": "string", "enum": ["spring", "summer", "autumn", "winter"] }, "recommendation": { "type": "string" } } } },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | city.json | 归属 | 天气数据属于城市 |
| N:1 | country.json | 归属 | 冗余关联 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 年度 | 月度气候数据来自历史气象API |
| 社区 PR | 按需 | 穿衣建议、季节注意事项 |
| 自动化 | 实时 | 实时空气质量来自IQAir等 |
| 人工审核 | 季度 | 灾害风险、季节性建议 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| NOAA | API | 历史气象数据 |
| World Weather Online | API | 月度气候数据 |
| IQAir | API | 空气质量 |
| 社区贡献 | UGC | 实际季节体验、穿衣建议 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/weather/{city_id} | 详情 | 城市气候完整数据 |
| GET /api/v1/weather/compare | 对比 | 多城市气候对比 |
| GET /api/v1/weather/best-time | 最佳时间 | 输入偏好，推荐最佳旅行时间 |
| GET /api/v1/weather/packing-list | 打包清单 | 基于目的地和日期的打包建议 |
| GET /api/v1/weather/air-quality | 空气质量 | 实时空气质量 |
| GET /api/v1/weather/disaster-risk | 灾害风险 | 自然灾害风险指数 |

---

## 8. Salary Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "salary",
  "type": "object",
  "required": ["id", "country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan-salary-2026" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "city_id": { "type": "string", "description": "可选：关联 city.json" },
    "year": { "type": "integer", "description": "数据年份" },
    "currency": { "type": "string", "description": "ISO 4217 货币代码" },
    "avg_annual_salary_local": { "type": "number" },
    "avg_annual_salary_usd": { "type": "number" },
    "median_annual_salary_usd": { "type": "number" },
    "min_wage_monthly_usd": { "type": "number" },
    "min_wage_hourly_usd": { "type": "number" },
    "profession_salaries": { "type": "array", "items": { "type": "object", "properties": { "profession": { "type": "string" }, "experience_level": { "type": "string", "enum": ["entry", "mid", "senior", "lead", "executive"] }, "avg_annual_usd": { "type": "number" }, "median_annual_usd": { "type": "number" }, "range_min_usd": { "type": "number" }, "range_max_usd": { "type": "number" } } } },
    "remote_salary_multiplier": { "type": "number", "description": "远程工作薪资乘数（相对于本地）" },
    "freelancer_avg_hourly_usd": { "type": "number" },
    "tech_industry_avg_usd": { "type": "number" },
    "tax_rate_estimate": { "type": "number", "description": "预估税后实际收入比例" },
    "purchasing_power_index": { "type": "number", "description": "购买力指数（相对于纽约）" },
    "salary_after_tax_example": { "type": "array", "items": { "type": "object", "properties": { "gross_annual_usd": { "type": "number" }, "tax_estimate_usd": { "type": "number" }, "net_annual_usd": { "type": "number" } } } },
    "source": { "type": "string", "description": "数据来源" },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 薪资数据属于国家 |
| N:1 | city.json | 归属 | 可选：城市级薪资数据 |
| 1:1 | tax.json | 参考 | 薪资与税务关联 |
| 1:1 | cost.json | 参考 | 薪资与生活成本对比 |
| 1:1 | remote-job.json | 参考 | 远程工作薪资参考 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 年度 | 薪资数据来自 Glassdoor/Indeed/Payscale |
| 社区 PR | 按需 | 特定职业、实际薪资经验 |
| 自动化 | 月度 | 汇率换算、购买力指数更新 |
| 人工审核 | 季度 | 职业薪资数据的准确性 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| Glassdoor | API | 薪资数据 |
| Indeed | API | 职位薪资 |
| Payscale | API | 薪资调查 |
| 各国统计局 | 官方 | 最低工资、平均工资 |
| 社区贡献 | UGC | 实际薪资经验 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/salary/{country_id} | 详情 | 薪资完整数据 |
| GET /api/v1/salary/compare | 对比 | 多国薪资对比 |
| POST /api/v1/salary/calculator | 计算器 | 输入职业和经验，估算薪资 |
| GET /api/v1/salary/net-income | 净收入 | 输入毛收入，计算税后实际收入 |
| GET /api/v1/salary/purchasing-power | 购买力 | 薪资购买力对比 |
| GET /api/v1/salary/remote-rates | 远程薪资 | 远程工作薪资参考 |

---

## 9. Cost Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "cost",
  "type": "object",
  "required": ["id", "country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan-cost-2026" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "city_id": { "type": "string", "description": "可选：关联 city.json" },
    "currency": { "type": "string" },
    "cost_of_living_index": { "type": "number", "description": "相对于纽约（100）" },
    "rent_index": { "type": "number" },
    "groceries_index": { "type": "number" },
    "restaurant_index": { "type": "number" },
    "transport_index": { "type": "number" },
    "utilities_index": { "type": "number" },
    "sports_and_leisure_index": { "type": "number" },
    "clothing_index": { "type": "number" },
    "monthly_costs": {
      "type": "object",
      "description": "月度开销明细",
      "properties": {
        "budget_single_usd": { "type": "number", "description": "单人预算型" },
        "moderate_single_usd": { "type": "number", "description": "单人中等型" },
        "luxury_single_usd": { "type": "number", "description": "单人豪华型" },
        "budget_family_usd": { "type": "number", "description": "家庭预算型" },
        "moderate_family_usd": { "type": "number", "description": "家庭中等型" },
        "luxury_family_usd": { "type": "number", "description": "家庭豪华型" },
        "breakdown": { "type": "object", "properties": { "rent_1br_city_center_usd": { "type": "number" }, "rent_1br_outskirts_usd": { "type": "number" }, "rent_3br_city_center_usd": { "type": "number" }, "rent_3br_outskirts_usd": { "type": "number" }, "utilities_monthly_usd": { "type": "number" }, "internet_monthly_usd": { "type": "number" }, "mobile_plan_monthly_usd": { "type": "number" }, "transport_monthly_usd": { "type": "number" }, "groceries_monthly_usd": { "type": "number" }, "restaurant_meal_cheap_usd": { "type": "number" }, "restaurant_meal_mid_usd": { "type": "number" }, "restaurant_meal_expensive_usd": { "type": "number" }, "coworking_monthly_usd": { "type": "number" }, "gym_monthly_usd": { "type": "number" }, "cinema_ticket_usd": { "type": "number" }, "coffee_cappuccino_usd": { "type": "number" }, "beer_local_usd": { "type": "number" }, "wine_bottle_usd": { "type": "number" } } } }
      }
    },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 消费数据属于国家 |
| N:1 | city.json | 归属 | 可选：城市级消费数据 |
| 1:1 | salary.json | 对比 | 消费与薪资对比 |
| 1:1 | tax.json | 参考 | 税务对消费的影响 |
| 1:N | cowork.json | 参考 | 共享办公空间价格 |
| 1:N | healthcare.json | 参考 | 医疗成本 |
| 1:N | education.json | 参考 | 教育成本 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 月度 | 生活成本指数来自 Numbeo |
| 社区 PR | 按需 | 具体价格、实际消费经验 |
| 自动化 | 季度 | 汇率换算、指数更新 |
| 人工审核 | 季度 | 价格的准确性和时效性 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| Numbeo | API | 生活成本指数 |
| Expatistan | API | 消费价格对比 |
| 社区贡献 | UGC | 实际消费经验 |
| 当地生活者 | 社区 | 最新价格 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/cost/{country_id} | 详情 | 消费完整数据 |
| GET /api/v1/cost/compare | 对比 | 多国消费对比 |
| POST /api/v1/cost/budget-calculator | 预算计算器 | 输入生活方式，估算月开销 |
| GET /api/v1/cost/living-standard | 生活水平 | 某薪资在某国的生活水平 |
| GET /api/v1/cost/currency-conversion | 汇率 | 实时汇率转换 |
| GET /api/v1/cost/inflation-rate | 通胀率 | 通胀率数据 |

---

## 10. Remote-Job Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "remote-job",
  "type": "object",
  "required": ["id", "title", "company", "status"],
  "properties": {
    "id": { "type": "string", "example": "job-12345" },
    "title": { "type": "string", "example": "Senior Frontend Engineer" },
    "company": { "type": "string", "example": "Stripe" },
    "company_size": { "type": "string", "enum": ["startup", "small", "medium", "large", "enterprise"] },
    "company_website": { "type": "string", "format": "uri" },
    "job_type": { "type": "string", "enum": ["full_time", "part_time", "contract", "freelance", "internship"] },
    "remote_type": { "type": "string", "enum": ["fully_remote", "hybrid", "remote_friendly", "timezone_flexible", "async"] },
    "location_requirements": {
      "type": "object",
      "properties": {
        "is_global": { "type": "boolean" },
        "allowed_countries": { "type": "array", "items": { "type": "string", "description": "ISO 3166-1 alpha-2" } },
        "excluded_countries": { "type": "array", "items": { "type": "string" } },
        "timezone_requirements": { "type": "string" },
        "visa_sponsorship": { "type": "boolean" }
      }
    },
    "salary_range": {
      "type": "object",
      "properties": {
        "min_usd": { "type": "number" },
        "max_usd": { "type": "number" },
        "currency": { "type": "string" },
        "period": { "type": "string", "enum": ["hourly", "monthly", "annual"] },
        "is_equity_included": { "type": "boolean" }
      }
    },
    "skills_required": { "type": "array", "items": { "type": "string" } },
    "experience_years_min": { "type": "integer" },
    "experience_years_max": { "type": "integer" },
    "department": { "type": "string", "enum": ["engineering", "design", "product", "marketing", "sales", "support", "operations", "finance", "legal", "hr", "data", "content", "devops", "security", "other"] },
    "job_description": { "type": "string" },
    "application_url": { "type": "string", "format": "uri" },
    "posted_at": { "type": "string", "format": "date-time" },
    "expires_at": { "type": "string", "format": "date-time" },
    "is_active": { "type": "boolean" },
    "source_platform": { "type": "string", "enum": ["remoteok", "weworkremotely", "angel", "linkedin", "indeed", "greenhouse", "lever", "company_careers", "other"] },
    "source_url": { "type": "string", "format": "uri" },
    "status": { "type": "string", "enum": ["published", "draft", "archived", "expired"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:M | country.json | 允许 | 职位允许工作的国家 |
| N:M | city.json | 推荐 | 推荐的城市（基于时区、网络） |
| N:M | cowork.json | 关联 | 远程工作者常用的共享办公空间 |
| 1:1 | salary.json | 参考 | 薪资参考 |
| 1:1 | internet.json | 参考 | 网络要求参考 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| 自动化爬虫 | 实时 | 从 RemoteOK/WeWorkRemotely 等平台抓取 |
| 社区 PR | 按需 | 手动提交的新职位 |
| 自动化 | 每日 | 检查职位是否已过期 |
| 人工审核 | 按需 | 社区提交职位的验证 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| RemoteOK | API | 远程职位数据 |
| WeWorkRemotely | API | 远程职位数据 |
| AngelList | API | 创业公司职位 |
| LinkedIn | API | 职位数据 |
| 公司官网 | 爬虫 | 直接招聘信息 |
| 社区贡献 | UGC | 手动提交 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/jobs | 列表 | 支持过滤、排序、分页 |
| GET /api/v1/jobs/{id} | 详情 | 职位完整信息 |
| GET /api/v1/jobs/search | 搜索 | 全文搜索 |
| POST /api/v1/jobs/filter | 过滤 | 按技能、薪资、地点过滤 |
| GET /api/v1/jobs/recommendations | 推荐 | 基于用户画像的推荐 |
| GET /api/v1/jobs/by-country/{country_id} | 按国家 | 某国可申请的职位 |
| GET /api/v1/jobs/trending | 趋势 | 热门职位 |
| POST /api/v1/jobs/alert | 订阅 | 订阅职位提醒 |
| GET /api/v1/jobs/salary-insights | 薪资洞察 | 远程职位薪资分析 |

---

## 11. Flight Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "flight",
  "type": "object",
  "required": ["id", "origin_country_id", "destination_country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "pek-hnd" },
    "origin_country_id": { "type": "string", "description": "关联 country.json" },
    "origin_city_id": { "type": "string", "description": "关联 city.json" },
    "destination_country_id": { "type": "string", "description": "关联 country.json" },
    "destination_city_id": { "type": "string", "description": "关联 city.json" },
    "route_type": { "type": "string", "enum": ["direct", "one_stop", "multi_stop"] },
    "flight_duration_hours": { "type": "number" },
    "distance_km": { "type": "number" },
    "timezone_difference_hours": { "type": "number" },
    "typical_airlines": { "type": "array", "items": { "type": "string" } },
    "avg_price_range_usd": {
      "type": "object",
      "properties": {
        "economy_low": { "type": "number" },
        "economy_high": { "type": "number" },
        "business_low": { "type": "number" },
        "business_high": { "type": "number" },
        "first_low": { "type": "number" },
        "first_high": { "type": "number" }
      }
    },
    "price_seasonal": {
      "type": "object",
      "properties": {
        "high_season": { "type": "array", "items": { "type": "integer", "minimum": 1, "maximum": 12 } },
        "low_season": { "type": "array", "items": { "type": "integer", "minimum": 1, "maximum": 12 } },
        "high_season_multiplier": { "type": "number", "description": "旺季价格乘数" }
      }
    },
    "best_booking_time_days": { "type": "integer", "description": "最佳预订提前天数" },
    "visa_transit_requirements": { "type": "string", "description": "中转签证要求" },
    "common_layover_cities": { "type": "array", "items": { "type": "string" } },
    "jet_lag_severity": { "type": "string", "enum": ["none", "mild", "moderate", "severe"] },
    "carbon_emission_kg": { "type": "number", "description": "碳排放（单程）" },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 出发 | 出发国家 |
| N:1 | country.json | 到达 | 到达国家 |
| N:1 | city.json | 出发城市 | 出发城市 |
| N:1 | city.json | 到达城市 | 到达城市 |
| N:M | visa.json | 中转 | 中转签证要求 |
| 1:1 | weather.json | 参考 | 目的地天气参考 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 实时 | 航班价格、时刻来自 Skyscanner/Kiwi |
| 社区 PR | 按需 | 航空公司推荐、中转经验 |
| 自动化 | 月度 | 平均价格、季节性趋势 |
| 人工审核 | 季度 | 签证中转要求、航空公司信息 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| Skyscanner | API | 航班价格、时刻 |
| Kiwi | API | 航班数据 |
| IATA | 官方 | 航空公司、机场代码 |
| 社区贡献 | UGC | 实际飞行经验、价格 |
| 航空公司官网 | 官方 | 准确的价格和政策 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/flights | 列表 | 航班查询 |
| GET /api/v1/flights/{id} | 详情 | 航线完整信息 |
| GET /api/v1/flights/search | 搜索 | 按出发/到达、日期搜索 |
| POST /api/v1/flights/price-alert | 价格提醒 | 订阅价格变动 |
| GET /api/v1/flights/cheapest-months | 最便宜月份 | 某航线的最便宜月份 |
| GET /api/v1/flights/carbon-footprint | 碳足迹 | 碳排放计算 |
| GET /api/v1/flights/by-country/{country_id} | 按国家 | 从某国出发的所有航线 |
| GET /api/v1/flights/visa-transit | 中转签证 | 中转签证要求查询 |

---

## 12. Passport Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "passport",
  "type": "object",
  "required": ["id", "country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "chn-passport" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "passport_type": { "type": "string", "enum": ["ordinary", "official", "diplomatic", "service", "emergency", "temporary"] },
    "validity_years": { "type": "integer" },
    "visa_free_countries": { "type": "integer", "description": "免签国家数量" },
    "visa_on_arrival_countries": { "type": "integer" },
    "evisa_countries": { "type": "integer" },
    "visa_required_countries": { "type": "integer" },
    "henley_index_rank": { "type": "integer", "description": "Henley Passport Index 排名" },
    "henley_index_score": { "type": "integer", "description": "可免签/落地签目的地数量" },
    "passport_power_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "visa_free_list": { "type": "array", "items": { "type": "object", "properties": { "country_id": { "type": "string" }, "country_name": { "type": "string" }, "duration_days": { "type": "integer" }, "conditions": { "type": "string" } } } },
    "visa_on_arrival_list": { "type": "array", "items": { "type": "object", "properties": { "country_id": { "type": "string" }, "country_name": { "type": "string" }, "duration_days": { "type": "integer" }, "fee_usd": { "type": "number" }, "conditions": { "type": "string" } } } },
    "evisa_list": { "type": "array", "items": { "type": "object", "properties": { "country_id": { "type": "string" }, "country_name": { "type": "string" }, "duration_days": { "type": "integer" }, "fee_usd": { "type": "number" }, "processing_days": { "type": "integer" }, "conditions": { "type": "string" } } } },
    "visa_required_list": { "type": "array", "items": { "type": "object", "properties": { "country_id": { "type": "string" }, "country_name": { "type": "string" }, "visa_type": { "type": "string" }, "processing_days": { "type": "integer" }, "fee_usd": { "type": "number" } } } },
    "renewal_requirements": { "type": "array", "items": { "type": "string" } },
    "dual_citizenship_allowed": { "type": "boolean" },
    "tax_obligations_abroad": { "type": "string", "description": "海外税务义务说明" },
    "military_service_required": { "type": "boolean" },
    "voting_rights_abroad": { "type": "boolean" },
    "embassy_consulate_list": { "type": "array", "items": { "type": "object", "properties": { "city": { "type": "string" }, "country": { "type": "string" }, "address": { "type": "string" }, "phone": { "type": "string" }, "email": { "type": "string" }, "website": { "type": "string" }, "services": { "type": "array", "items": { "type": "string" } } } } },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 护照属于国家 |
| N:M | country.json | 免签 | 免签国家列表 |
| N:M | visa.json | 适用 | 适用的签证类型 |
| 1:1 | tax.json | 参考 | 海外税务义务 |
| 1:1 | healthcare.json | 参考 | 海外医疗保障 |
| 1:1 | education.json | 参考 | 海外教育权利 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| 自动化 | 实时 | 免签列表来自 Henley Passport Index API |
| 官方同步 | 月度 | 中国外交部更新免签政策 |
| 社区 PR | 按需 | 使馆信息、实际使用经验 |
| 人工审核 | 季度 | 税务义务、双重国籍政策 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| Henley Passport Index | 官方 | 护照排名、免签数据 |
| 中国外交部 | 官方 | 免签政策 |
| Arton Capital | 官方 | Passport Index 数据 |
| 各国使馆 | 官方 | 准确的签证要求 |
| 社区贡献 | UGC | 实际使用经验 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/passports | 列表 | 所有护照信息 |
| GET /api/v1/passports/{country_id} | 详情 | 某国护照完整信息 |
| GET /api/v1/passports/{country_id}/visa-free | 免签 | 免签国家列表 |
| GET /api/v1/passports/compare | 对比 | 多护照对比 |
| GET /api/v1/passports/ranking | 排名 | 护照实力排名 |
| POST /api/v1/passports/travel-plan | 旅行计划 | 输入目的地，检查签证要求 |
| GET /api/v1/passports/policy-changes | 政策变动 | 近期免签政策变动 |
| GET /api/v1/passports/dual-citizenship | 双重国籍 | 双重国籍政策对比 |
| GET /api/v1/passports/tax-obligations | 税务义务 | 海外税务义务说明 |

---

## 13. Healthcare Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "healthcare",
  "type": "object",
  "required": ["id", "country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan-healthcare" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "city_id": { "type": "string", "description": "可选：关联 city.json" },
    "system_type": { "type": "string", "enum": ["universal_public", "universal_private", "mixed", "private_only", "none"] },
    "quality_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "accessibility_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "life_expectancy": { "type": "number" },
    "infant_mortality_rate": { "type": "number" },
    "doctors_per_1000": { "type": "number" },
    "hospital_beds_per_1000": { "type": "number" },
    "health_expenditure_gdp_percent": { "type": "number" },
    "public_vs_private_ratio": { "type": "string", "description": "公立/私立医疗比例" },
    "is_mandatory_insurance": { "type": "boolean" },
    "insurance_cost_monthly_usd": { "type": "number" },
    "insurance_coverage": { "type": "array", "items": { "type": "string", "enum": ["hospital", "outpatient", "dental", "vision", "mental_health", "maternity", "prescription", "emergency", "evacuation", "pre_existing"] } },
    "recommended_insurance_plans": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "provider": { "type": "string" }, "monthly_cost_usd": { "type": "number" }, "coverage_summary": { "type": "string" }, "website": { "type": "string" } } } },
    "common_medications_availability": { "type": "string", "enum": ["widespread", "common", "limited", "rare", "restricted"] },
    "prescription_requirements": { "type": "string", "description": "处方药要求" },
    "english_speaking_doctors": { "type": "string", "enum": ["widespread", "common", "limited", "rare"] },
    "emergency_services_quality": { "type": "string", "enum": ["excellent", "good", "fair", "poor"] },
    "ambulance_response_time_minutes": { "type": "number" },
    "vaccination_requirements": { "type": "array", "items": { "type": "string" } },
    "water_safety": { "type": "string", "enum": ["safe", "treatable", "unsafe"] },
    "food_safety_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "mental_health_support": { "type": "string", "enum": ["excellent", "good", "fair", "poor"] },
    "women_healthcare_quality": { "type": "string", "enum": ["excellent", "good", "fair", "poor"] },
    "lgbtq_healthcare_quality": { "type": "string", "enum": ["excellent", "good", "fair", "poor"] },
    "recommended_hospitals": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "city": { "type": "string" }, "type": { "type": "string", "enum": ["public", "private", "international"] }, "english_support": { "type": "boolean" }, "specialties": { "type": "array", "items": { "type": "string" } }, "website": { "type": "string" } } } },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 医疗体系属于国家 |
| N:1 | city.json | 归属 | 可选：城市级医疗数据 |
| 1:1 | cost.json | 参考 | 医疗成本 |
| 1:1 | insurance.json | 参考 | 保险推荐 |
| 1:1 | visa.json | 参考 | 签证对医疗的要求 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 年度 | 医疗指数、寿命数据来自 WHO/World Bank |
| 社区 PR | 按需 | 医院推荐、保险经验 |
| 自动化 | 月度 | 保险价格、医院信息 |
| 人工审核 | 季度 | 医疗质量、特殊群体服务 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| WHO | 官方 | 医疗数据、寿命 |
| World Bank | API | 医疗支出、医生密度 |
| Numbeo | API | 医疗质量指数 |
| 保险公司 | 官方 | 保险价格、覆盖范围 |
| 社区贡献 | UGC | 实际医疗体验、医院推荐 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/healthcare/{country_id} | 详情 | 医疗体系完整信息 |
| GET /api/v1/healthcare/compare | 对比 | 多国医疗对比 |
| POST /api/v1/healthcare/insurance-recommendation | 保险推荐 | 基于需求推荐保险 |
| GET /api/v1/healthcare/hospitals | 医院 | 推荐医院列表 |
| GET /api/v1/healthcare/emergency-info | 紧急信息 | 紧急医疗信息 |
| GET /api/v1/healthcare/vaccination-requirements | 疫苗 | 疫苗要求查询 |
| POST /api/v1/healthcare/cost-estimate | 费用估算 | 估算医疗费用 |

---

## 14. Education Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "education",
  "type": "object",
  "required": ["id", "country_id", "status"],
  "properties": {
    "id": { "type": "string", "example": "japan-education" },
    "country_id": { "type": "string", "description": "关联 country.json" },
    "city_id": { "type": "string", "description": "可选：关联 city.json" },
    "system_type": { "type": "string", "enum": ["public", "private", "mixed", "international", "homeschool_friendly"] },
    "quality_index": { "type": "number", "minimum": 0, "maximum": 100 },
    "literacy_rate": { "type": "number", "minimum": 0, "maximum": 100 },
    "pisa_math_ranking": { "type": "integer" },
    "pisa_reading_ranking": { "type": "integer" },
    "pisa_science_ranking": { "type": "integer" },
    "school_types": { "type": "array", "items": { "type": "object", "properties": { "type": { "type": "string", "enum": ["public", "private", "international", "bilingual", "montessori", "waldorf", "religious"] }, "description": { "type": "string" }, "avg_annual_cost_usd": { "type": "number" }, "language_of_instruction": { "type": "string" }, "curriculum": { "type": "string", "enum": ["local", "ib", "igcse", "ap", "a_level", "national", "mixed"] }, "admission_difficulty": { "type": "string", "enum": ["easy", "moderate", "competitive", "very_competitive"] } } } },
    "university_rankings": { "type": "array", "items": { "type": "object", "properties": { "name": { "type": "string" }, "qs_ranking": { "type": "integer" }, "times_ranking": { "type": "integer" }, "specialties": { "type": "array", "items": { "type": "string" } }, "tuition_annual_usd": { "type": "number" }, "language_of_instruction": { "type": "string" }, "acceptance_rate": { "type": "number" }, "website": { "type": "string" } } } },
    "student_visa_requirements": { "type": "array", "items": { "type": "string" } },
    "work_while_studying_allowed": { "type": "boolean" },
    "work_hours_limit_per_week": { "type": "integer" },
    "post_graduation_work_permit": { "type": "boolean" },
    "post_graduation_work_duration_months": { "type": "integer" },
    "path_to_permanent_residence": { "type": "boolean" },
    "scholarship_availability": { "type": "string", "enum": ["widespread", "common", "limited", "rare"] },
    "language_learning_opportunities": { "type": "array", "items": { "type": "string" } },
    "expat_children_education_options": { "type": "array", "items": { "type": "object", "properties": { "type": { "type": "string" }, "description": { "type": "string" }, "avg_cost_usd": { "type": "number" }, "pros": { "type": "array", "items": { "type": "string" } }, "cons": { "type": "array", "items": { "type": "string" } } } } },
    "status": { "type": "string", "enum": ["published", "draft", "archived"] },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "contributor_ids": { "type": "array", "items": { "type": "string" } }
  }
}
```

| 关系 | 目标实体 | 关系类型 | 说明 |
|------|----------|----------|------|
| N:1 | country.json | 归属 | 教育体系属于国家 |
| N:1 | city.json | 归属 | 可选：城市级教育数据 |
| 1:1 | cost.json | 参考 | 教育成本 |
| 1:1 | visa.json | 参考 | 学生签证要求 |
| 1:1 | healthcare.json | 参考 | 学生医疗保障 |
| 1:1 | salary.json | 参考 | 毕业后薪资 |

| 更新方式 | 频率 | 说明 |
|----------|------|------|
| API 同步 | 年度 | 排名、排名数据来自 QS/THE |
| 社区 PR | 按需 | 学校推荐、实际学费、录取经验 |
| 自动化 | 月度 | 学费、汇率换算 |
| 人工审核 | 季度 | 录取难度、政策变动 |

| 数据来源 | 类型 | 说明 |
|----------|------|------|
| QS World Rankings | 官方 | 大学排名 |
| Times Higher Education | 官方 | 大学排名 |
| PISA | 官方 | 基础教育质量 |
| 学校官网 | 官方 | 学费、课程、录取要求 |
| 社区贡献 | UGC | 实际录取经验、学费 |
| 留学中介 | 社区 | 申请经验 |

| 未来API | 端点 | 说明 |
|----------|------|------|
| GET /api/v1/education/{country_id} | 详情 | 教育体系完整信息 |
| GET /api/v1/education/compare | 对比 | 多国教育对比 |
| POST /api/v1/education/university-search | 大学搜索 | 按排名、专业、学费搜索 |
| GET /api/v1/education/student-visa-guide | 签证指南 | 学生签证指南 |
| POST /api/v1/education/cost-calculator | 费用计算器 | 估算留学总费用 |
| GET /api/v1/education/scholarships | 奖学金 | 奖学金信息 |
| GET /api/v1/education/post-graduation-paths | 毕业后路径 | 毕业后工作/移民路径 |
| GET /api/v1/education/expat-children-options | 外籍儿童 | 外籍儿童教育选择 |

---

## 全局关系图谱 (ER Diagram)

```
                    ┌─────────────┐
                    │  passport   │
                    │  (护照)      │
                    └──────┬──────┘
                           │ N:M
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
            ┌──────────┐  ┌──────────┐
            │  country │  │   visa   │
            │  (国家)   │  │  (签证)   │
            └────┬─────┘  └────┬─────┘
                 │ N:1         │ N:1
                 │             │
      ┌──────┬───┴───┬──────┐  │
      │      │       │      │  │
      ▼      ▼       ▼      ▼  ▼
  ┌──────┐┌─────┐┌──────┐┌──────┐┌──────┐
  │ city ││cost ││salary││weather││internet│
  │(城市) ││(消费)││(薪资) ││(天气)  ││(网络)  │
  └──┬───┘└─────┘└──────┘└──────┘└──────┘
     │ N:1
     │
     ▼
  ┌──────┐
  │cowork│
  │(共享) │
  └──────┘

  ┌──────┐    ┌──────┐    ┌──────┐
  │flight│    │health│    │edu   │
  │(航班) │    │(医疗) │    │(教育) │
  └──────┘    └──────┘    └──────┘
     │ N:1       │ N:1       │ N:1
     │           │           │
     └───────────┴───────────┘
                 │
                 ▼
            ┌──────────┐
            │  country │
            │  (国家)   │
            └──────────┘

  ┌──────────┐
  │remote-job│
  │(远程工作) │
  └────┬─────┘
       │ N:M
       │
       ▼
  ┌──────────┐
  │  country │
  │  (国家)   │
  └──────────┘
```

---

## 数据更新策略矩阵

| 实体 | 自动更新 | 社区贡献 | 专家审核 | 频率 |
|------|----------|----------|----------|------|
| country | World Bank API | 基础修正 | 政治/CRS | 月度 |
| visa | 移民局官网 | 经验分享 | 政策解读 | 按需 |
| city | Numbeo API | 体验评分 | 指数验证 | 月度 |
| cowork | 品牌官网 | 新开/关闭 | 价格验证 | 按需 |
| tax | OECD API | 经验分享 | 税务专家 | 年度 |
| internet | Speedtest API | 审查状态 | 技术验证 | 月度 |
| weather | NOAA API | 穿衣建议 | 气候专家 | 年度 |
| salary | Glassdoor API | 实际薪资 | 数据验证 | 年度 |
| cost | Numbeo API | 价格更新 | 指数验证 | 月度 |
| remote-job | 职位平台爬虫 | 手动提交 | 真实性验证 | 实时 |
| flight | Skyscanner API | 航线经验 | 价格验证 | 实时 |
| passport | Henley API | 使用经验 | 政策验证 | 月度 |
| healthcare | WHO API | 医院推荐 | 医疗专家 | 年度 |
| education | QS API | 录取经验 | 教育专家 | 年度 |

---

## 数据治理规范

1. **数据来源标注**: 每条数据必须标注来源（官方/API/社区/专家）
2. **时效性管理**: 每条数据必须标注最后验证日期和预计失效日期
3. **版本控制**: 所有数据变更必须可追溯，支持历史版本对比
4. **多语言支持**: 核心数据支持中英双语，未来扩展多语言
5. **隐私合规**: 社区贡献数据需匿名化处理，符合 GDPR/CCPA
6. **质量评分**: 每条数据有质量评分（来源可靠性+时效性+验证次数）

---

## 技术架构建议

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 数据存储 | PostgreSQL + JSONB | 结构化+灵活schema |
| 缓存 | Redis | 热点数据缓存 |
| 搜索 | Elasticsearch | 全文搜索 |
| API | GraphQL + REST | 灵活查询 |
| 版本控制 | Git + DVC | 数据版本控制 |
| 自动化 | GitHub Actions | 数据同步、验证 |
| 监控 | Grafana + Prometheus | 数据质量监控 |
| 文档 | OpenAPI/Swagger | API文档自动生成 |

---

*Data Architecture v1.0 | Global Mobility Infrastructure*
