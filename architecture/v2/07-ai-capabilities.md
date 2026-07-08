# 第七部分：AI 时代能力设计

## 愿景

> 让 ChatGPT、Claude、Gemini、Cursor、Windsurf、Claude Code 等所有AI Agent，都能直接调用Digital Nomad CN的数据。

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent 调用全景                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   用户: "帮我找一个适合数字游民的东南亚国家"                  │
│                                                             │
│        ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│        │ ChatGPT │  │ Claude  │  │  Cursor │               │
│        │   GPTs  │  │  MCP    │  │  Agent  │               │
│        └────┬────┘  └────┬────┘  └────┬────┘               │
│             │            │            │                     │
│             └────────────┼────────────┘                     │
│                          │                                  │
│                   ┌──────┴──────┐                          │
│                   │ MCP Server  │                          │
│                   │ (nomad-mcp) │                          │
│                   └──────┬──────┘                          │
│                          │                                  │
│        ┌─────────────────┼─────────────────┐               │
│        │                 │                 │               │
│        ▼                 ▼                 ▼               │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐           │
│   │ Semantic│      │Structured│     │  RAG   │           │
│   │ Search  │      │ Output  │      │ Engine │           │
│   └─────────┘      └─────────┘      └─────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. MCP Server

### 架构

```
mcp-server/
├── src/
│   ├── index.ts              # MCP Server入口
│   ├── tools/
│   │   ├── index.ts          # 工具注册
│   │   ├── search-countries.ts
│   │   ├── get-country.ts
│   │   ├── search-cities.ts
│   │   ├── get-city.ts
│   │   ├── get-visa.ts
│   │   ├── compare-costs.ts
│   │   ├── calculate-tax.ts
│   │   ├── find-coworking.ts
│   │   ├── find-coliving.ts
│   │   ├── get-weather.ts
│   │   ├── check-internet.ts
│   │   └── recommend-destinations.ts
│   ├── resources/
│   │   ├── country.ts        # 国家资源
│   │   └── city.ts           # 城市资源
│   └── utils/
│       └── data-loader.ts
├── package.json
└── README.md
```

### 工具列表

| 工具 | 描述 | 示例调用 |
|------|------|----------|
| `nomad_search_countries` | 搜索国家 | `region: "southeast-asia"` |
| `nomad_get_country` | 获取国家详情 | `id: "thailand"` |
| `nomad_search_cities` | 搜索城市 | `country: "thailand"` |
| `nomad_get_city` | 获取城市详情 | `id: "chiang-mai"` |
| `nomad_get_visa` | 查询签证 | `from: "CHN", to: "THA"` |
| `nomad_compare_costs` | 对比生活成本 | `cities: ["chiang-mai", "bangkok"]` |
| `nomad_calculate_tax` | 计算税务 | `country: "portugal", income: 50000` |
| `nomad_find_coworking` | 找联合办公 | `city: "chiang-mai"` |
| `nomad_find_coliving` | 找共居空间 | `city: "chiang-mai"` |
| `nomad_get_weather` | 查询气候 | `city: "chiang-mai", month: 11` |
| `nomad_check_internet` | 查询网络 | `city: "chiang-mai"` |
| `nomad_recommend` | 智能推荐 | `budget: 1000, climate: "warm"` |

### 安装方式

```bash
# npx方式（零安装）
npx @digital-nomad-cn/mcp

# 全局安装
npm install -g @digital-nomad-cn/mcp

# 配置文件（claude_desktop_config.json）
{
  "mcpServers": {
    "digital-nomad": {
      "command": "npx",
      "args": ["@digital-nomad-cn/mcp"],
      "env": {
        "NOMAD_API_KEY": "your-api-key"
      }
    }
  }
}
```

---

## 2. Embedding & Vector Search

### 数据Embedding

```typescript
// ai/embeddings/generate.ts

import { OpenAI } from 'openai';
import { loadDataset } from '../utils/data-loader';

const openai = new OpenAI();

// 为每个国家生成Embedding
async function generateCountryEmbeddings() {
  const countries = await loadDataset('countries');
  
  for (const country of countries) {
    const text = `
      国家: ${country.name.zh}
      区域: ${country.region}
      首都: ${country.capital}
      人口: ${country.population}
      货币: ${country.currency.code}
      标签: ${country.tags.join(', ')}
      描述: ${country.description?.zh || ''}
    `;
    
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
    });
    
    await saveEmbedding(country.id, embedding.data[0].embedding);
  }
}
```

### 语义搜索API

```
POST /ai/search
{
  "query": "我想找一个物价低、天气好、有中文社区的地方",
  "language": "zh",
  "topK": 5
}

Response:
{
  "results": [
    {
      "country": "thailand",
      "city": "chiang-mai",
      "score": 0.92,
      "reason": "清迈生活成本低（$800/月），天气温暖，有大量中文社区"
    },
    {
      "country": "malaysia",
      "city": "penang",
      "score": 0.87,
      "reason": "槟城物价低，中文通用，有华人社区"
    }
  ]
}
```

---

## 3. RAG (Retrieval-Augmented Generation)

### 架构

```
┌─────────────────────────────────────────┐
│           RAG Pipeline                   │
│                                         │
│  1. 用户查询                            │
│     "东南亚哪个城市最适合远程工作？"      │
│                                         │
│  2. 查询理解                            │
│     → 意图识别: destination_recommendation│
│     → 实体提取: {region: "southeast-asia"}│
│     → 约束提取: {remote_work: true}      │
│                                         │
│  3. 数据检索                            │
│     → Vector Search: 语义匹配           │
│     → Structured Query: 条件筛选        │
│     → Rank: 综合评分排序                │
│                                         │
│  4. 上下文构建                          │
│     → 检索Top-5相关数据                 │
│     → 格式化上下文                      │
│                                         │
│  5. LLM生成                             │
│     → Prompt: 上下文 + 用户问题         │
│     → 生成结构化回答                    │
│                                         │
│  6. 输出                                │
│     → 结构化JSON                        │
│     → 附带数据来源                      │
└─────────────────────────────────────────┘
```

### RAG Prompt 模板

```
你是一个全球数字游民数据专家。基于以下数据，回答用户问题。

## 相关数据
{retrieved_context}

## 用户问题
{user_question}

## 回答要求
1. 基于提供的数据回答，不要编造
2. 如果数据不足，明确说明
3. 引用数据来源
4. 保持中立客观
5. 使用用户使用的语言回答

## 输出格式
请返回以下JSON格式：
{
  "answer": "详细回答",
  "sources": [
    {"type": "country", "id": "thailand", "field": "cost"}
  ],
  "confidence": 0.95,
  "relatedQuestions": ["相关问题1", "相关问题2"]
}
```

---

## 4. Structured Output

### 输出Schema定义

```json
{
  "name": "destination_recommendation",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "recommendations": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "rank": { "type": "integer" },
            "country": { "type": "string" },
            "city": { "type": "string" },
            "matchScore": { "type": "number" },
            "matchReasons": {
              "type": "array",
              "items": { "type": "string" }
            },
            "monthlyCost": {
              "type": "object",
              "properties": {
                "min": { "type": "integer" },
                "max": { "type": "integer" },
                "currency": { "type": "string" }
              }
            },
            "visaInfo": {
              "type": "object",
              "properties": {
                "type": { "type": "string" },
                "duration": { "type": "string" },
                "requirements": { "type": "string" }
              }
            },
            "pros": {
              "type": "array",
              "items": { "type": "string" }
            },
            "cons": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["rank", "country", "city", "matchScore", "matchReasons"]
        }
      },
      "summary": { "type": "string" },
      "disclaimer": { "type": "string" }
    },
    "required": ["recommendations", "summary"]
  }
}
```

### 调用示例

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "你是一个全球数字游民目的地推荐专家。基于提供的数据推荐最适合的目的地。"
    },
    {
      role: "user",
      content: `基于以下数据，推荐3个最适合预算$1000/月、喜欢温暖气候、需要高速网络的数字游民目的地：
      
      ${retrievedData}`
    }
  ],
  response_format: {
    type: "json_schema",
    json_schema: destinationRecommendationSchema
  }
});
```

---

## 5. Agent API

### 设计原则

```
AI Agent调用原则：
1. 工具化：每个功能都是一个可调用的工具
2. 自描述：工具自带描述，AI能理解用途
3. 类型安全：输入输出都有严格Schema
4. 可组合：多个工具可以组合使用
5. 有回退：工具失败时有优雅降级
```

### Agent专用端点

```
POST /agent/recommend
{
  "profile": {
    "budget": { "monthly": 1000, "currency": "USD" },
    "climate": "warm",
    "internet": { "minSpeed": 50 },
    "visa": { "preferred": ["visa-free", "digital-nomad-visa"] },
    "language": "zh",
    "duration": "3-6 months"
  },
  "preferences": {
    "community": "chinese-speaking",
    "activities": ["beach", "food", "culture"],
    "avoid": ["cold", "expensive"]
  }
}

Response:
{
  "destinations": [...],
  "comparison": {...},
  "itinerary": {...},
  "budget": {...}
}
```

---

## 6. 各平台集成方案

### ChatGPT (GPTs)

```
GPT名称: 全球数字游民助手
描述: 基于Digital Nomad CN开放数据，帮你规划全球数字游民生活

Actions:
- search_countries
- get_visa_info
- compare_costs
- recommend_destinations

Auth: API Key
```

### Claude (Desktop App)

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "digital-nomad": {
      "command": "npx",
      "args": ["-y", "@digital-nomad-cn/mcp@latest"]
    }
  }
}
```

### Cursor

```
在Cursor中使用：
1. 安装MCP Server
2. 在Composer中直接询问：
   "帮我写一个Next.js应用，展示东南亚数字游民城市"
   → Cursor自动调用API获取数据
   → 生成完整代码
```

### Windsurf

```
在Windsurf中使用：
1. 配置MCP
2. 使用Cascade Agent：
   "帮我分析泰国和马来西亚哪个更适合远程工作"
   → Agent自动获取两国数据
   → 生成对比分析
```

---

## 7. AI能力部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    AI Layer Architecture                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  MCP Server │  │  Semantic   │  │  Agent API  │     │
│  │  (Tools)    │  │  Search     │  │  (Recommend)│     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│              ┌───────────┴───────────┐                  │
│              │    API Gateway        │                  │
│              │    (Cloudflare)       │                  │
│              └───────────┬───────────┘                  │
│                          │                              │
│         ┌────────────────┼────────────────┐             │
│         │                │                │             │
│    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐          │
│    │ Embeddings│   │ Vector  │    │ LLM     │          │
│    │ (OpenAI)  │   │ DB      │    │ (API)   │          │
│    │           │   │(Pinecone│    │         │          │
│    │           │   │/Qdrant) │    │         │          │
│    └───────────┘   └─────────┘    └─────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 技术选型

| 组件 | 技术 | 理由 |
|------|------|------|
| Embedding | OpenAI text-embedding-3-large | 质量高、价格低 |
| Vector DB | Pinecone / Qdrant | 高性能、易用 |
| LLM | OpenAI GPT-4o / Claude 3.5 | 支持Structured Output |
| MCP Server | Node.js + @modelcontextprotocol/sdk | 官方SDK |
| 缓存 | Cloudflare KV | 边缘缓存 |
