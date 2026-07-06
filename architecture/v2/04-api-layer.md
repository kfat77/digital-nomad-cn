# 第四部分：API 层设计

## 设计目标

> 让任何AI Agent、任何应用、任何开发者，都能以标准化的方式访问全球数字游民数据。

```
┌─────────────────────────────────────────────────────────────┐
│                      API Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│   │  REST   │  │ GraphQL │  │   MCP   │  │ Webhook │      │
│   │  API    │  │  API    │  │ Server  │  │ Events  │      │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │
│        │            │            │            │            │
│        └────────────┴────────────┴────────────┘            │
│                      │                                      │
│              ┌───────┴───────┐                             │
│              │  API Gateway  │                             │
│              │  (Cloudflare) │                             │
│              └───────┬───────┘                             │
│                      │                                      │
│        ┌─────────────┼─────────────┐                       │
│        │             │             │                       │
│   ┌────┴────┐  ┌────┴────┐  ┌────┴────┐                  │
│   │schemas/ │  │datasets/│  │ derived │                  │
│   │(JSON)   │  │(JSON)   │  │(computed│                  │
│   └─────────┘  └─────────┘  └─────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. REST API

### 基础规范

```yaml
baseUrl: https://api.digital-nomad.cn/v1
format: JSON
auth: API Key (header: X-API-Key)
rateLimit: 1000 requests/day (free), 10000/day (pro)
cors: enabled
compression: gzip
```

### 端点设计

#### 国家/地区

```
GET  /countries              # 列出所有国家
GET  /countries/{id}         # 获取单个国家
GET  /countries/{id}/cities  # 获取国家下所有城市
GET  /countries/search?q=    # 搜索国家
```

**响应示例：**
```json
{
  "data": {
    "id": "thailand",
    "name": { "zh": "泰国", "en": "Thailand" },
    "region": "southeast-asia",
    "population": 71697030,
    "currency": { "code": "THB", "symbol": "฿" },
    "flag": "🇹🇭",
    "tags": ["digital-nomad-friendly", "low-cost", "visa-friendly"]
  },
  "meta": {
    "version": "2.0.0",
    "lastUpdated": "2026-07-07T00:00:00Z"
  }
}
```

#### 城市

```
GET  /cities                 # 列出所有城市
GET  /cities/{id}            # 获取单个城市
GET  /cities?country=thailand # 按国家筛选
GET  /cities/nomadic         # 获取数字游民友好城市
GET  /cities/compare?a=chiang-mai&b=bangkok  # 对比城市
```

#### 签证

```
GET  /visa/{country}         # 获取某国所有签证类型
GET  /visa/{country}/{type}  # 获取特定签证详情
GET  /visa/requirements?from=CHN&to=THA  # 查询签证要求
GET  /visa/digital-nomad    # 获取所有数字游民签证
```

#### 护照

```
GET  /passport/{country}     # 获取护照免签信息
GET  /passport/ranking       # 护照排名
```

#### 税务

```
GET  /tax/{country}          # 获取某国税务规则
GET  /tax/compare?countries=thailand,portugal  # 税务对比
```

#### 生活成本

```
GET  /cost/{country}         # 国家生活成本
GET  /cost/{country}/{city}  # 城市生活成本
GET  /cost/compare           # 多城市对比
```

#### 搜索

```
GET  /search?q=              # 全文搜索
GET  /search/autocomplete?q= # 自动补全
```

### 通用响应格式

```json
{
  "data": {},           // 实际数据
  "meta": {
    "version": "2.0.0",
    "lastUpdated": "2026-07-07T00:00:00Z",
    "requestId": "req_abc123"
  },
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 177,
    "hasMore": true
  }
}
```

### 错误响应

```json
{
  "error": {
    "code": "COUNTRY_NOT_FOUND",
    "message": "Country 'xyz' not found",
    "status": 404,
    "docs": "https://docs.digital-nomad.cn/errors/COUNTRY_NOT_FOUND"
  }
}
```

---

## 2. GraphQL API

### 设计原则

- 一个端点：`POST /graphql`
- 强类型Schema（从JSON Schema自动生成）
- 支持复杂查询、嵌套、过滤

### Schema 示例

```graphql
type Query {
  # 国家查询
  countries(
    filter: CountryFilter
    sort: CountrySort
    pagination: PaginationInput
  ): CountryConnection
  
  country(id: ID!): Country
  
  # 城市查询
  cities(
    filter: CityFilter
    sort: CitySort
    pagination: PaginationInput
  ): CityConnection
  
  # 签证查询
  visaRequirements(
    from: ID!
    to: ID!
  ): [VisaRequirement]
  
  # 数字游民专用
  nomadDestinations(
    budget: BudgetRange
    climate: ClimatePreference
    minInternetSpeed: Int
  ): [Destination]
  
  # 搜索
  search(query: String!): SearchResult
}

type Country {
  id: ID!
  name: LocalizedString!
  region: String!
  population: Int
  currency: Currency
  cities: [City]
  visa(from: ID!): [Visa]
  costOfLiving: CostOfLiving
  tax: Tax
  internet: Internet
  safety: Safety
  nomadScore: NomadScore
}

type City {
  id: ID!
  name: LocalizedString!
  country: Country!
  coordinates: Coordinates
  nomadScore: NomadScore
  costOfLiving: CostOfLiving
  coworkingSpaces: [CoworkingSpace]
  colivingSpaces: [ColivingSpace]
}

type NomadScore {
  overall: Int!
  cost: Int
  internet: Int
  safety: Int
  fun: Int
  qualityOfLife: Int
}

# 支持嵌套查询
# 示例：查询泰国所有城市的生活成本和数字游民评分
query {
  country(id: "thailand") {
    name { zh }
    cities {
      name { zh }
      nomadScore { overall cost internet }
      costOfLiving { totalMonthly { budget moderate } }
    }
  }
}
```

---

## 3. MCP (Model Context Protocol)

### 设计目标

让 ChatGPT、Claude、Cursor、Windsurf 等 AI Agent 可以直接调用项目数据。

### MCP Server 架构

```
┌─────────────────────────────────────────┐
│           MCP Server                     │
│  ┌─────────────────────────────────────┐│
│  │  tools/list                          ││
│  │  ├─ nomad_search_countries          ││
│  │  ├─ nomad_get_country               ││
│  │  ├─ nomad_search_cities             ││
│  │  ├─ nomad_get_visa_requirements     ││
│  │  ├─ nomad_compare_costs             ││
│  │  ├─ nomad_calculate_tax             ││
│  │  ├─ nomad_find_coworking            ││
│  │  ├─ nomad_find_coliving             ││
│  │  ├─ nomad_get_weather               ││
│  │  ├─ nomad_check_internet            ││
│  │  └─ nomad_recommend_destinations    ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 工具定义示例

```json
{
  "name": "nomad_search_countries",
  "description": "Search for countries based on various criteria for digital nomads",
  "inputSchema": {
    "type": "object",
    "properties": {
      "region": {
        "type": "string",
        "description": "Filter by region (e.g., 'southeast-asia', 'eastern-europe')"
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Filter by tags (e.g., ['digital-nomad-friendly', 'low-cost'])"
      },
      "maxCost": {
        "type": "integer",
        "description": "Maximum monthly cost in USD"
      },
      "visaType": {
        "type": "string",
        "enum": ["visa-free", "digital-nomad-visa"],
        "description": "Filter by available visa types"
      },
      "language": {
        "type": "string",
        "enum": ["zh", "en"],
        "default": "zh",
        "description": "Response language"
      }
    }
  }
}
```

### AI Agent 调用示例

```
用户: "我想找一个东南亚生活成本低、有数字游民签证的国家"

AI → nomad_search_countries(
  region: "southeast-asia",
  tags: ["digital-nomad-friendly", "low-cost"],
  visaType: "digital-nomad-visa",
  maxCost: 1500
)

返回:
[
  {
    "id": "thailand",
    "name": "泰国",
    "reason": "有DTV签证，月生活成本$800-1200",
    "nomadScore": 92
  },
  {
    "id": "malaysia",
    "name": "马来西亚",
    "reason": "有DE Rantau签证，月生活成本$900-1400",
    "nomadScore": 88
  }
]
```

---

## 4. OpenAPI 规范

```yaml
openapi: 3.1.0
info:
  title: Digital Nomad CN API
  version: 2.0.0
  description: |
    全球最大的中文Global Mobility开放数据API。
    
    提供国家、城市、签证、税务、生活成本等数据的程序化访问。
  contact:
    name: Digital Nomad CN Team
    url: https://github.com/kfat77/digital-nomad-cn
  license:
    name: MIT
    url: https://github.com/kfat77/digital-nomad-cn/blob/main/LICENSE

servers:
  - url: https://api.digital-nomad.cn/v1
    description: Production
  - url: https://api-staging.digital-nomad.cn/v1
    description: Staging

paths:
  /countries:
    get:
      operationId: listCountries
      summary: 列出所有国家
      tags: [Countries]
      parameters:
        - name: region
          in: query
          schema: { type: string }
        - name: tag
          in: query
          schema: { type: array, items: { type: string } }
      responses:
        200:
          description: 国家列表
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CountryList'

  /countries/{id}:
    get:
      operationId: getCountry
      summary: 获取国家详情
      tags: [Countries]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        200:
          description: 国家详情
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Country'
        404:
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    Country:
      type: object
      required: [id, name]
      properties:
        id: { type: string }
        name:
          type: object
          properties:
            zh: { type: string }
            en: { type: string }
    # ... (更多Schema定义)

  responses:
    NotFound:
      description: 资源不存在
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  securitySchemes:
    ApiKey:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - ApiKey: []
```

---

## 5. JSON Feed

用于数据订阅和同步。

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Digital Nomad CN - Data Feed",
  "home_page_url": "https://digital-nomad.cn",
  "feed_url": "https://api.digital-nomad.cn/v1/feed.json",
  "description": "全球数字游民数据更新流",
  "author": {
    "name": "Digital Nomad CN Team",
    "url": "https://github.com/kfat77/digital-nomad-cn"
  },
  "items": [
    {
      "id": "country-thailand-updated",
      "url": "https://api.digital-nomad.cn/v1/countries/thailand",
      "title": "泰国数据已更新",
      "content_text": "泰国签证信息、生活成本数据已更新至2026年7月",
      "date_published": "2026-07-07T00:00:00Z",
      "tags": ["country", "thailand", "visa", "cost"],
      "_digital_nomad": {
        "entityType": "country",
        "entityId": "thailand",
        "changeType": "updated",
        "fieldsChanged": ["visa.digitalNomadVisa", "cost.monthlyCosts"]
      }
    }
  ]
}
```

---

## 6. RSS Feed

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Digital Nomad CN - 数据更新</title>
    <link>https://digital-nomad.cn</link>
    <description>全球数字游民开放数据更新通知</description>
    <language>zh-CN</language>
    <item>
      <title>泰国新增数字游民签证信息</title>
      <link>https://digital-nomad.cn/country/thailand</link>
      <pubDate>Mon, 07 Jul 2026 00:00:00 GMT</pubDate>
      <category>签证</category>
      <guid>country-thailand-visa-20260707</guid>
    </item>
  </channel>
</rss>
```

---

## 7. Webhook

### 事件类型

```
country.created
country.updated
country.deleted
city.updated
visa.updated
tax.updated
cost.updated
ranking.updated
```

### Webhook 载荷

```json
{
  "event": "country.updated",
  "timestamp": "2026-07-07T00:00:00Z",
  "data": {
    "countryId": "thailand",
    "changes": {
      "visa.digitalNomadVisa": {
        "old": { "available": false },
        "new": { "available": true, "duration": "5 years" }
      }
    },
    "updatedBy": "contributor-username",
    "commit": "abc123"
  }
}
```

### 订阅方式

```
POST /webhooks/subscribe
{
  "url": "https://your-app.com/webhook",
  "events": ["country.updated", "visa.updated"],
  "secret": "your-webhook-secret"
}
```

---

## 8. AI Agent 调用指南

### ChatGPT / GPTs

```
作为数字游民助手，我可以帮你查询全球数字游民数据。

我可以：
1. 搜索适合数字游民的国家和城市
2. 查询签证要求和政策
3. 比较不同城市的生活成本
4. 获取税务信息
5. 查找联合办公和共居空间

试试问我：
- "东南亚哪些国家适合数字游民？"
- "去日本需要什么签证？"
- "清迈和曼谷哪个生活成本低？"
- "葡萄牙的税务政策对数字游民友好吗？"
```

### Claude (via MCP)

```
用户: 帮我规划一个3个月的东南亚数字游民路线

Claude → 
  1. nomad_search_countries(region: "southeast-asia", tags: ["digital-nomad-friendly"])
  2. nomad_get_visa_requirements(from: "CHN", to: "THA")
  3. nomad_get_visa_requirements(from: "CHN", to: "VNM")
  4. nomad_compare_costs(cities: ["chiang-mai", "da-nang", "bali"])
  5. nomad_get_weather(city: "chiang-mai", months: [11,12,1])
  
→ 生成结构化行程建议
```

### Cursor / Windsurf (开发时)

```
开发者: 帮我写一个函数，根据预算筛选数字游民目的地

Cursor →
  // 查询API获取数据
  const destinations = await nomadAPI.search({
    maxCost: budget,
    tags: ['digital-nomad-friendly']
  });
  
  // 返回筛选结果
  return destinations.filter(d => d.nomadScore.overall > 80);
```

---

## API 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户 / AI Agent                       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  REST   │ │ GraphQL │ │   MCP   │
   │ /v1/... │ │/graphql │ │/mcp/... │
   └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │
        └───────────┼───────────┘
                    │
            ┌───────┴───────┐
            │  Cloudflare   │
            │   Workers     │
            │  (Edge API)   │
            └───────┬───────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────┴────┐ ┌────┴────┐ ┌────┴────┐
   │schemas/ │ │datasets/│ │ derived │
   │(GitHub) │ │(GitHub) │ │(computed│
   │         │ │         │ │  cache) │
   └─────────┘ └─────────┘ └─────────┘
```

### 技术选型

| 组件 | 技术 | 理由 |
|------|------|------|
| API Gateway | Cloudflare Workers | 全球边缘部署、免费额度高 |
| 缓存 | Cloudflare KV + Cache API | 边缘缓存，毫秒响应 |
| 数据存储 | GitHub (schemas/) | 版本控制、社区协作 |
| 速率限制 | Cloudflare Rate Limiting | 内置DDoS保护 |
| 监控 | Cloudflare Analytics | 免费、实时 |
