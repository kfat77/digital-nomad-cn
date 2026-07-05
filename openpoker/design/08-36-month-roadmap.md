# Open Poker Intelligence Platform — 36个月路线图

> **版本**: v1.0
> **设计日期**: 2026-06-17
> **时间跨度**: 2026年7月 — 2029年6月
> **最终目标**: 全球领先的开放扑克智能平台

---

## 目录

1. [最终形态定义](#一最终形态open-poker-intelligence-platform)
2. [Phase 1: Foundation（月1-9）](#二phase-1-foundation月1-9)
3. [Phase 2: Platform（月10-18）](#三phase-2-platform月10-18)
4. [Phase 3: Intelligence（月19-27）](#四phase-3-intelligence月19-27)
5. [Phase 4: Ecosystem（月28-36）](#五phase-4-ecosystem月28-36)
6. [里程碑总览](#六里程碑总览)
7. [资源与风险评估](#七资源与风险评估)

---

## 一、最终形态：Open Poker Intelligence Platform

### 1.1 平台定义

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPEN POKER INTELLIGENCE PLATFORM                         │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   LEARN      │  │   ANALYZE    │  │   SOLVE      │  │   COMPETE    │    │
│  │  学习        │  │  分析        │  │  求解        │  │  竞技        │    │
│  │  • 交互课程  │  │  • 手牌复盘  │  │  • GTO策略   │  │  • 排行榜    │    │
│  │  • AI教练    │  │  • 数据看板  │  │  • 实时辅助  │  │  • 锦标赛    │    │
│  │  • 间隔重复  │  │  • 漏洞分析  │  │  • 范围优化  │  │  • 团队战    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         OPEN LAYER                                   │   │
│  │  • Open API (REST/gRPC/GraphQL)    • MCP Server                      │   │
│  │  • Open SDK (JS/Python/Rust/Go)    • Plugin Architecture             │   │
│  │  • Open Strategy DB (Community)    • Open Hand History Format        │   │
│  │  • Open Evaluator (WASM/Core)      • Open Agent Protocol             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       INTELLIGENCE LAYER                             │   │
│  │  • LLM Agent (ReAct + RAG)         • Real-time Equity Engine         │   │
│  │  • Opponent Modeling               • Adaptive Strategy Learning      │   │
│  │  • Natural Language Interface      • Multi-modal Input               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        INFRASTRUCTURE                                │   │
│  │  • Rust Core (WASM/Native/GPU)     • Global CDN Edge Nodes           │   │
│  │  • Multi-tenant Cloud              • Blockchain-verified Hands       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心指标（36个月目标）

| 指标 | 目标 | 说明 |
|------|:----:|:-----|
| 月活跃用户 (MAU) | 100,000+ | 全球扑克玩家 |
| 手牌历史解析 | 1亿+ | 累计解析手牌数 |
| 权益计算请求 | 10亿+ | 累计 API 调用 |
| GTO 求解点数 | 1,000+ | 社区贡献的求解 spot |
| 开源贡献者 | 500+ | GitHub contributors |
| 第三方集成 | 50+ | 扑克站点/工具集成 |
| 支持平台 | 8+ | Web/Desktop/iOS/Android/CLI/VSCode/Discord/Telegram |
| 响应延迟 (P99) | < 50ms | 权益计算 API |
| 离线可用 | 100% | PWA 全功能离线 |

### 1.3 与现有竞品的差异化

| 维度 | PioSOLVER | GTO+ | DEEPFOLD | **OPIP (本平台)** |
|------|:---------:|:----:|:--------:|:----------------:|
| 价格 | $249-475 | $75 | 订阅制 | **免费开源** |
| 平台 | Windows | Windows | Web | **全平台** |
| API/SDK | ❌ | ❌ | ❌ | **✅ 全开放** |
| AI 教练 | ❌ | ❌ | 基础 | **✅ LLM Agent** |
| 社区策略 | ❌ | ❌ | ❌ | **✅ 共享DB** |
| MCP 集成 | ❌ | ❌ | ❌ | **✅ 原生支持** |
| 实时辅助 | ❌ | ❌ | ❌ | **✅ 毫秒级** |
| 手牌导入 | ❌ | ❌ | 基础 | **✅ 全平台** |

---

## 二、Phase 1: Foundation（月1-9）

> **时间**: 2026年7月 — 2027年3月  
> **主题**: 从零构建可运行的核心引擎  
> **里程碑**: Calculator v1.0 上线，用户可计算权益

### 2.1 目标

1. 建立完整的技术栈和开发基础设施
2. 实现高性能的牌型评估和权益计算引擎
3. 推出可使用的 Web 计算器
4. 建立开源社区基础

### 2.2 月1-3：Core Engine

**技术栈搭建**:
```
Week 1-2:  Monorepo 初始化
  • pnpm workspace + Turborepo
  • Rust workspace (Cargo.toml)
  • GitHub Actions CI/CD
  • Code of Conduct + CONTRIBUTING.md + MIT License
  
Week 3-4:  poker-types crate
  • Card, Suit, Rank, Hand 基础类型
  • serde 序列化
  • wasm-bindgen 绑定
  
Week 5-8:  poker-eval crate
  • Perfect Hash 5-card evaluator
  • 7-card evaluator (C(7,5)=21 枚举)
  • A-2-3-4-5 小顺处理
  • 性能基准测试 (< 10ns/5-card)
  
Week 9-12: poker-equity crate
  • Fisher-Yates 洗牌采样
  • Monte Carlo 2-way equity
  • Exact enumeration (Flop/Turn)
  • Auto-switch (2M combo threshold)
  • 多线程并行 (rayon)
```

**交付物**:
- `crates/poker-eval`: 牌型评估库
- `crates/poker-equity`: 权益计算库
- 性能报告: 100K MC / < 100ms (单线程)

### 2.3 月4-6：Web Calculator v1.0

**WASM 绑定**:
```
Week 13-14: wasm-pack 集成
  • wasm-bindgen 接口
  • 批量评估 API (减少 JS↔WASM 开销)
  
Week 15-16: Web Worker
  • 计算移入 Worker，主线程零阻塞
  • 进度回调 (postMessage)
  
Week 17-18: UI 实现
  • React 19 + Vite
  • 两步选牌（花色→数字）
  • 概率条可视化
  • 阶段指示器 (Pre-flop → River)
  
Week 19-20: PWA
  • Service Worker (Workbox)
  • manifest.json
  • 离线可用
  
Week 21-24: 优化 & 发布
  • 响应式设计 (mobile-first)
  • 首次内容绘制 < 1s
  • GitHub Pages 部署
  • Reddit/2+2 社区发布
```

**交付物**:
- `apps/web`: 在线权益计算器
- `packages/@poker-suite/engine-wasm`: WASM npm 包
- 在线地址: https://poker-suite.dev

### 2.4 月7-9：Range System + i18n

**范围系统**:
```
Week 25-28: poker-range crate
  • 1326-bit mask 表示
  • 文本解析 ("AA,AKs,T5o+")
  • 并/交/差/补运算
  • 13×13 矩阵可视化
  
Week 29-32: Range Matrix UI
  • 可交互的 13×13 矩阵
  • 点击选择/取消
  • 预设范围加载 (UTG open, BTN steal 等)
  • 范围百分比显示
  
Week 33-36: i18n 系统
  • 10 语言支持 (zh/en/ja/ko/es/fr/de/pt/ru/it)
  • 翻译键管理系统
  • RTL 支持 (阿拉伯语预留)
```

**交付物**:
- `crates/poker-range`: 范围运算库
- `apps/web`: 范围矩阵 + 多语言
- npm 包: `@poker-suite/engine-wasm@0.3.0`

### 2.5 Phase 1 里程碑

```
┌────────────────────────────────────────┐
│  Phase 1 里程碑                        │
├────────────────────────────────────────┤
│ ✅ Rust Core Engine (eval + equity)    │
│ ✅ Web Calculator (PWA, offline)       │
│ ✅ Range System (1326-bit + matrix)    │
│ ✅ i18n (10 languages)                 │
│ ✅ Open Source (MIT, GitHub)           │
│ ✅ Performance: < 100ms / 100K MC      │
│ 📊 目标: 1,000 MAU                     │
└────────────────────────────────────────┘
```

### 2.6 Phase 1 技术栈

| 层级 | 技术 |
|------|------|
| Core | Rust + Perfect Hash Evaluator |
| WASM | wasm-bindgen + wasm-pack |
| Web | React 19 + Vite + Zustand |
| i18n | react-i18next |
| CI/CD | GitHub Actions |
| Deploy | GitHub Pages |

---

## 三、Phase 2: Platform（月10-18）

> **时间**: 2027年4月 — 2027年12月  
> **主题**: 从计算器进化为平台  
> **里程碑**: SDK + API + Desktop + 手牌历史分析上线

### 3.1 目标

1. 开放核心能力（SDK + API）
2. 多平台覆盖（Desktop + CLI）
3. 手牌历史导入与分析系统
4. 社区策略数据库

### 3.2 月10-12：SDK & API

**TypeScript SDK**:
```typescript
// packages/@poker-suite/sdk
import { PokerSDK } from '@poker-suite/sdk';

const sdk = new PokerSDK();

// 权益计算
const result = await sdk.calculateEquity({
  hero: ['As', 'Kh'],
  villain: 'JJ+',
  board: ['Ts', '9d', '2h'],
});
// → { equity: 0.473, win: 0.452, tie: 0.042 }

// 范围运算
const range = sdk.parseRange('AA,AKs,AQo+,66-99');
const percent = range.percent(); // → 12.4%
```

**REST API**:
```yaml
POST /v1/equity
POST /v1/range/parse
POST /v1/range/operations
GET  /v1/strategy/preflop/{position}
GET  /health
```

**OpenAPI 3.1 + llms.txt**:
- 自动生成文档
- AI 友好（机器可读）

**gRPC** (内部服务):
```protobuf
service EquityService {
  rpc Calculate(EquityRequest) returns (EquityResponse);
  rpc CalculateStream(EquityRequest) returns (stream ProgressResponse);
}
```

**交付物**:
- `@poker-suite/sdk@1.0.0` (npm)
- `api.poker-suite.dev` (REST API)
- 开发者文档站点

### 3.3 月13-15：Desktop + CLI

**Tauri Desktop App**:
```
├── src/                    # Web UI (复用 apps/web)
├── src-tauri/
│   ├── src/
│   │   ├── main.rs         # Tauri 入口
│   │   └── commands/
│   │       ├── engine.rs   # 原生 Rust 引擎调用
│   │       ├── storage.rs  # 本地 SQLite 存储
│   │       └── file.rs     # 文件系统访问
│   └── Cargo.toml          # 依赖 poker-core
```

特性:
- 安装包 < 10MB
- 原生性能（比 WASM 快 2x）
- 本地 SQLite 数据库
- 文件拖拽导入
- 自动更新 (Tauri updater)

**CLI Tool**:
```bash
# 安装
$ cargo install poker-suite-cli

# 权益计算
$ poker-suite equity --hero "AsKh" --villain "JJ+" --board "Ts9d2h"
# → Equity: 47.3% (Win: 45.2%, Tie: 4.2%)

# 范围解析
$ poker-suite range parse "AA,AKs,AQo+,66-99"
# → 165 combos (12.4%)

# 手牌解析
$ poker-suite parse hand-history.txt --site ggpoker
# → Parsed 1,247 hands

# 批量权益
$ poker-suite equity batch --input matchups.csv --output results.csv
```

**交付物**:
- Desktop App (Win/Mac/Linux)
- CLI binary
- Homebrew 安装支持

### 3.4 月16-18：Database + Parser + Analytics

**手牌历史解析器**:
```rust
// crates/poker-parser
pub struct HandHistoryParser {
    // 支持平台
    // • PokerStars
    // • GG Poker
    // • PartyPoker
    // • 888poker
    // • Ignition/Bovada
    // • iPoker Network
}
```

**数据库 Schema**:
```sql
-- 手牌表
CREATE TABLE hands (
    id TEXT PRIMARY KEY,
    site TEXT,
    hand_number TEXT,
    timestamp INTEGER,
    game_type TEXT,
    table_name TEXT,
    button_position INTEGER,
    hero_hand TEXT,          -- e.g., "AsKh"
    board TEXT,              -- e.g., "Ts9d2h5cJd"
    result REAL,             -- 盈亏 ($)
    rake REAL,
    raw_text TEXT
);

-- 行动表
CREATE TABLE actions (
    hand_id TEXT,
    street TEXT,             -- preflop/flop/turn/river
    player TEXT,
    position TEXT,
    action_type TEXT,        -- fold/check/call/bet/raise/allin
    amount REAL,
    order_index INTEGER
);

-- 会话统计表
CREATE TABLE player_stats (
    player_name TEXT,
    hands INTEGER,
    vpip REAL,               -- Voluntarily Put $ In Pot
    pfr REAL,                -- Pre-flop Raise
    af REAL,                 -- Aggression Factor
    wtsd REAL,               -- Went To Showdown
    wsd REAL,                -- Won $ At Showdown
    bb_per_100 REAL          -- Big Blinds per 100 hands
);
```

**Analytics Dashboard**:
- 盈亏曲线 (Bankroll Chart)
- 位置统计 (Heatmap)
- 手牌分类分布
- 漏洞分析 (Leak Finder)
- 对手建模 (基础 HUD 数据)

**交付物**:
- `crates/poker-parser`
- `apps/web`: Database + Analytics 页面
- `apps/desktop`: 本地数据库 + 文件导入

### 3.5 Phase 2 里程碑

```
┌────────────────────────────────────────┐
│  Phase 2 里程碑                        │
├────────────────────────────────────────┤
│ ✅ SDK (@poker-suite/sdk v1.0)         │
│ ✅ REST API (api.poker-suite.dev)      │
│ ✅ Desktop App (Tauri, 3 平台)         │
│ ✅ CLI Tool (cargo install)            │
│ ✅ Hand History Parser (5+ 平台)       │
│ ✅ Local Database + Analytics          │
│ ✅ Community Strategy DB (基础)        │
│ 📊 目标: 10,000 MAU                    │
└────────────────────────────────────────┘
```

### 3.6 Phase 2 技术栈演进

| 新增组件 | 技术 |
|----------|------|
| API Server | Rust + Axum + gRPC |
| Database | SQLite (local) + DuckDB (analytics) |
| Desktop | Tauri v2 |
| CLI | clap + indicatif |
| Parser | Rust (ANTLR-like 手写) |
| Charts | ECharts / D3.js |
| Storage | OPFS (browser) + SQLite (desktop) |

---

## 四、Phase 3: Intelligence（月19-27）

> **时间**: 2028年1月 — 2028年9月  
> **主题**: 引入 AI 智能和高级求解能力  
> **里程碑**: AI Coach + GTO Solver + MCP Server 上线

### 4.1 目标

1. AI 驱动的教练系统（LLM Agent + RAG）
2. GTO Solver（2-player postflop）
3. MCP Server 协议开放
4. 实时决策辅助（毫秒级）

### 4.2 月19-21：AI Agent & Coach

**架构**:
```
User Query (NL)
    │
    ▼
┌─────────────────┐
│  Intent Router  │  → equity / strategy / analysis / training / chat
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌─────────┐
│ Tools │ │ RAG KB  │
└───┬───┘ └────┬────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────┐
│  ReAct Loop     │
│  Thought → Action → Observation → ...
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Memory System  │
│  Hot/Warm/Cold  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response       │
│  (Streaming)    │
└─────────────────┘
```

**RAG 知识库**:
- GTO 策略文档（向量化）
- 翻前范围表
- 视频教学内容
- 用户历史对局

**AI Coach 功能**:
```
用户: "我在 BTN 用 AKs 面对 3bet 应该怎么办？"

Agent:
  1. 查询 BTN vs 3bet 范围 → AKs 在 4bet/call 范围
  2. 计算 AKs vs 3bet range 的 equity → ~47.3%
  3. 查询 pot odds → 需要 33% equity
  4. 综合建议:
     "AKs 在 BTN 面对 3bet 是一个标准的 4bet 或 call。
     
     数学分析:
     • Equity vs 典型 3bet 范围: 47.3%
     • Pot odds: 需要 33%
     • 结论: 数学上 call 和 4bet 都是 +EV
     
     策略建议:
     • 100BB 深度: 4bet 到 22-25BB
     • 对手紧: 倾向 call
     • 对手松: 倾向 4bet"
```

**交付物**:
- `agent/`: Python + LangGraph + MCP Client
- `apps/web`: AI Coach 聊天界面
- 流式响应 (SSE)

### 4.3 月22-24：GTO Solver

**DCFR 实现**:
```rust
// crates/poker-solver
pub struct DCFRSolver {
    tree: GameTree,
    regrets: HashMap<InfoSetId, Vec<f64>>,
    strategy_sums: HashMap<InfoSetId, Vec<f64>>,
    // DCFR 参数
    alpha: f64,  // 1.5
    beta: f64,   // 0.0
    gamma: f64,  // 2.0
}

impl DCFRSolver {
    /// DCFR 迭代
    pub fn iterate_dcfr(&mut self) {
        for player in 0..self.num_players {
            self.traverse_dcfr(self.root, player, 1.0, 1.0);
        }
        self.iteration += 1;
    }
    
    /// DCFR 折扣更新
    fn update_regret_dcfr(&mut self, info_set: InfoSetId, action: usize, regret: f64) {
        let t = self.iteration as f64;
        let regrets = self.regrets.get_mut(&info_set).unwrap();
        
        // 正遗憾折扣
        if regret > 0.0 {
            let discount = t.powf(self.alpha) / (t.powf(self.alpha) + 1.0);
            regrets[action] = regrets[action] * discount + regret;
        } else {
            // 负遗憾折扣
            let discount = t.powf(self.beta) / (t.powf(self.beta) + 1.0);
            regrets[action] = regrets[action] * discount + regret;
        }
    }
}
```

**求解器 UI**:
- 博弈树可视化
- 策略矩阵显示（每手牌的行动频率）
- EV 计算
- Exploitability 曲线
- 导出策略文件

**限制**:
- 初始仅支持 2-player
- 单加注底池 (SRP)
- 3 街动作抽象
- 下注尺寸: 33%, 75%, all-in

**交付物**:
- `crates/poker-solver`: DCFR 求解器
- `apps/web`: Solver UI
- 示例策略文件 (社区共享)

### 4.4 月25-27：MCP Server + 实时辅助

**MCP Server**:
```typescript
// packages/@poker-suite/mcp-server

export const pokerTools = [
  {
    name: "poker_calculate_equity",
    description: "Calculate equity for a hand vs opponent range",
    parameters: z.object({
      hero: z.string(),
      villain: z.string(),
      board: z.string().optional(),
    }),
    handler: async (params) => { ... }
  },
  {
    name: "poker_query_range",
    description: "Query recommended range for position/action",
    parameters: z.object({
      position: z.enum(["UTG", "MP", "CO", "BTN", "SB", "BB"]),
      action: z.enum(["open", "call", "3bet", "4bet"]),
    }),
    handler: async (params) => { ... }
  },
  {
    name: "poker_parse_hand",
    description: "Parse hand history and analyze",
    parameters: z.object({
      text: z.string(),
    }),
    handler: async (params) => { ... }
  },
  {
    name: "poker_gto_strategy",
    description: "Query GTO strategy for a spot",
    parameters: z.object({
      position: z.string(),
      board: z.string(),
      pot_size: z.number(),
      spr: z.number(),
    }),
    handler: async (params) => { ... }
  }
];
```

**实时辅助 (Real-time Assist)**:
- 与 PokerTracker / HM3 集成（通过 HUD 接口）
- 实时显示对手统计数据
- 实时 equity 计算（当前手牌 vs 对手范围）
- 行动建议 (fold/call/raise)

**注意**: 实时辅助需要遵守各平台的 ToS，设计为"学习模式"而非"作弊工具"

**交付物**:
- `@poker-suite/mcp-server` (npm)
- MCP Registry 提交
- 实时辅助 Beta（桌面端）

### 4.5 Phase 3 里程碑

```
┌────────────────────────────────────────┐
│  Phase 3 里程碑                        │
├────────────────────────────────────────┤
│ ✅ AI Coach (LLM Agent + RAG)          │
│ ✅ GTO Solver (DCFR, 2-player)         │
│ ✅ MCP Server (4 tools)                │
│ ✅ Real-time Assist (Beta)             │
│ ✅ Community Strategy DB (100+ spots)  │
│ ✅ Streaming Response (SSE)            │
│ 📊 目标: 50,000 MAU                    │
└────────────────────────────────────────┘
```

### 4.6 Phase 3 技术栈演进

| 新增组件 | 技术 |
|----------|------|
| AI Agent | Python + LangGraph + OpenAI API |
| RAG | ChromaDB + OpenAI Embeddings |
| Solver | Rust DCFR (桌面原生) |
| MCP | TypeScript + @modelcontextprotocol/sdk |
| Streaming | SSE / WebSocket |
| Real-time | Native messaging (Tauri) |

---

## 五、Phase 4: Ecosystem（月28-36）

> **时间**: 2028年10月 — 2029年6月  
> **主题**: 构建开放生态系统  
> **里程碑**: Open Poker Intelligence Platform 正式版

### 5.1 目标

1. 多租户云服务
2. 插件架构（第三方扩展）
3. 社区经济（策略市场、贡献奖励）
4. 全球覆盖（CDN、多区域部署）

### 5.2 月28-30：Cloud Platform

**多租户架构**:
```
┌─────────────────────────────────────────┐
│              API Gateway                │
│  • Rate Limiting (per API key)          │
│  • Authentication (JWT/OAuth2)          │
│  • Request Routing                      │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
┌──────────┐      ┌──────────┐
│ REST API │      │ gRPC API │
│ (public) │      │ (pro)    │
└────┬─────┘      └────┬─────┘
     │                 │
     └────────┬────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
┌──────────┐      ┌──────────┐
│ Worker   │      │ Solver   │
│ Pool     │      │ Cluster  │
│ (Equity) │      │ (GPU)    │
└──────────┘      └──────────┘
```

**定价模型**:
| 层级 | 价格 | 权益 |
|------|:----:|:-----|
| Free | $0 | 100 次/天 API, 基础功能 |
| Pro | $9.99/月 | 10,000 次/天, Solver, Analytics |
| Team | $49.99/月 | 无限, 团队共享, 优先支持 |
| Enterprise | 定制 | 私有部署, SLA, 定制开发 |

**交付物**:
- `cloud.poker-suite.dev`
- Stripe 支付集成
- 用户仪表盘

### 5.3 月31-33：Plugin Architecture

**插件系统**:
```typescript
// 插件接口
interface PokerPlugin {
  name: string;
  version: string;
  author: string;
  
  // 注册工具
  registerTools(): ToolDefinition[];
  
  // 注册 UI 组件
  registerComponents(): ComponentDefinition[];
  
  // 注册数据源
  registerDataSources(): DataSourceDefinition[];
}

// 示例插件: Omaha 支持
const omahaPlugin: PokerPlugin = {
  name: "omaha",
  version: "1.0.0",
  
  registerTools() {
    return [
      {
        name: "omaha_equity",
        handler: async (params) => {
          // Omaha 4 牌权益计算
        }
      }
    ];
  },
  
  registerComponents() {
    return [
      {
        id: "omaha-selector",
        render: () => <OmahaCardSelector />
      }
    ];
  }
};
```

**插件市场**:
- 官方插件: Omaha, Short Deck, Stud
- 社区插件: 自定义 HUD, 主题, 分析工具
- 插件审核流程

**交付物**:
- Plugin SDK
- Plugin Marketplace
- 首批 10+ 官方插件

### 5.4 月34-36：Community & Global

**社区建设**:
- 策略分享平台（用户上传 GTO 策略）
- 论坛 + Discord 服务器
- 每月锦标赛（免费参赛，奖品）
- 贡献者奖励计划（GitHub bounties）

**全球化**:
- CDN 部署（Cloudflare Workers）
- 区域节点: US-East, EU-Central, Asia-Pacific
- 本地化: 15+ 语言
- 合规: GDPR, CCPA

**合作伙伴**:
- 扑克培训网站集成
- 扑克室 HUD 兼容
- 流媒体工具（OBS 插件）

**交付物**:
- 社区平台
- 全球 CDN
- 合作伙伴 SDK

### 5.5 Phase 4 里程碑

```
┌────────────────────────────────────────┐
│  Phase 4 里程碑                        │
├────────────────────────────────────────┤
│ ✅ Cloud Platform (Multi-tenant)       │
│ ✅ Plugin Architecture + Marketplace   │
│ ✅ Global CDN (3 regions)              │
│ ✅ Community (Forum + Discord + Events)│
│ ✅ Partners (10+ integrations)         │
│ ✅ 15+ Languages                       │
│ 📊 目标: 100,000 MAU                   │
└────────────────────────────────────────┘
```

### 5.6 Phase 4 技术栈演进

| 新增组件 | 技术 |
|----------|------|
| Cloud | Kubernetes + Terraform |
| CDN | Cloudflare Workers |
| Payment | Stripe |
| Auth | Auth0 / Clerk |
| Analytics | PostHog / Amplitude |
| Monitoring | Datadog / Grafana |
| Plugin | WASM Plugin System |

---

## 六、里程碑总览

### 6.1 36 个月时间线

```
2026        2027        2028        2029
  Q3 Q4      Q1 Q2 Q3 Q4      Q1 Q2 Q3
  ├──────────┼──────────┼──────────┤
  │ Phase 1  │ Phase 2  │ Phase 3  │ Phase 4 │
  │ Foundation│ Platform │ Intelligence│ Ecosystem│
  │ (月1-9)  │ (月10-18)│ (月19-27)│ (月28-36)│
  └──────────┴──────────┴──────────┴─────────┘
```

### 6.2 关键里程碑时间表

| 月份 | 里程碑 | 指标 |
|:---:|:------|:----:|
| 月3 | Core Engine 完成 | < 10ns eval |
| 月6 | Web Calculator 上线 | 1,000 MAU |
| 月9 | Phase 1 完成 | 10 语言, Range UI |
| 月12 | SDK + API 发布 | 100 npm downloads |
| 月15 | Desktop + CLI 上线 | 3 平台 |
| 月18 | Phase 2 完成 | 10,000 MAU |
| 月21 | AI Coach 上线 | 1,000 对话/日 |
| 月24 | GTO Solver 上线 | 100 spots |
| 月27 | Phase 3 完成 | 50,000 MAU |
| 月30 | Cloud 平台上线 | 100 付费用户 |
| 月33 | Plugin Market 上线 | 10 插件 |
| 月36 | **OPIP 正式版** | **100,000 MAU** |

### 6.3 功能演进矩阵

| 功能 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|:-------:|:-------:|:-------:|:-------:|
| 牌型评估 | ✅ | ✅ | ✅ | ✅ |
| 权益计算 | ✅ | ✅ | ✅ | ✅ |
| 范围矩阵 | ✅ | ✅ | ✅ | ✅ |
| Web App | ✅ | ✅ | ✅ | ✅ |
| i18n (10) | ✅ | ✅ | ✅ | ✅ (15+) |
| SDK | — | ✅ | ✅ | ✅ |
| REST API | — | ✅ | ✅ | ✅ |
| Desktop | — | ✅ | ✅ | ✅ |
| CLI | — | ✅ | ✅ | ✅ |
| HH Parser | — | ✅ | ✅ | ✅ |
| Analytics | — | ✅ | ✅ | ✅ |
| Database | — | ✅ | ✅ | ✅ |
| AI Coach | — | — | ✅ | ✅ |
| GTO Solver | — | — | ✅ | ✅ |
| MCP Server | — | — | ✅ | ✅ |
| Real-time | — | — | ✅ | ✅ |
| Cloud | — | — | — | ✅ |
| Plugin | — | — | — | ✅ |
| CDN | — | — | — | ✅ |
| 社区 | — | — | — | ✅ |

---

## 七、资源与风险评估

### 7.1 团队需求

| Phase | 角色 | 人数 | 说明 |
|:------|:-----|:----:|:-----|
| 1 | Rust 工程师 | 2 | Core engine |
| 1 | 前端工程师 | 1 | Web UI |
| 1 | 产品经理 | 1 | 兼职 |
| 2 | Rust 工程师 | 2 | Parser + Desktop |
| 2 | 前端工程师 | 1 | Analytics |
| 2 | DevOps | 1 | CI/CD |
| 3 | AI 工程师 | 2 | Agent + RAG |
| 3 | 算法工程师 | 1 | Solver |
| 3 | 前端工程师 | 1 | Solver UI |
| 4 | 后端工程师 | 2 | Cloud |
| 4 | 社区经理 | 1 | 增长 |
| 4 | 商务 | 1 | 合作伙伴 |

### 7.2 预算估算

| 项目 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | 总计 |
|------|:-------:|:-------:|:-------:|:-------:|:----:|
| 人力 | $60K | $120K | $180K | $240K | $600K |
| 基础设施 | $0 | $1K | $5K | $20K | $26K |
| AI API | $0 | $0 | $5K | $10K | $15K |
| 营销 | $0 | $5K | $20K | $50K | $75K |
| **总计** | **$60K** | **$126K** | **$210K** | **$320K** | **$716K** |

### 7.3 风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
|------|:----:|:----:|:---------|
| Rust WASM 性能不达预期 | 中 | 高 | 备选方案: C++ WASM, 纯 JS fallback |
| GTO Solver 计算量过大 | 高 | 中 | 限制初始功能, MCCFR, 云 GPU |
| 开源社区不活跃 | 中 | 高 | 悬赏计划, 文档, 教程 |
| 竞品降价/免费 | 低 | 中 | 差异化 (开放生态, AI, 多平台) |
| 法律风险 (实时辅助) | 中 | 高 | 明确学习工具定位, 不违规辅助 |
| AI 幻觉导致错误策略 | 中 | 高 | RAG 锚定, 数学验证, 免责声明 |

### 7.4 退出指标 (Go/No-Go)

| 检查点 | 时间 | 指标 | 阈值 |
|--------|:----:|:----:|:----:|
| Phase 1 Gate | 月9 | MAU | ≥ 500 |
| Phase 2 Gate | 月18 | MAU | ≥ 5,000 |
| Phase 3 Gate | 月27 | MAU | ≥ 20,000 |
| Phase 4 Gate | 月30 | 付费用户 | ≥ 50 |
| 最终评估 | 月36 | MAU | ≥ 50,000 |

**若不达阈值**: 调整方向，缩小范围，聚焦核心功能

---

## 八、附录：技术债务管理

| Phase | 债务 | 处理策略 |
|:------|:-----|:---------|
| 1 | WASM 体积较大 | 月6 前优化到 < 300KB |
| 1 | 无测试覆盖 | 月3 起要求 > 80% |
| 2 | 桌面端签名 | 月15 前完成 Apple/Microsoft 签名 |
| 2 | API 限流未实现 | 月12 前完成 |
| 3 | Solver 内存泄漏 | 月22 前 Valgrind 检测 |
| 3 | AI 响应慢 | 月21 前优化到 < 2s |
| 4 | 数据库分片 | 月30 前完成 |
| 4 | 插件安全隔离 | 月31 前 WASM sandbox |

---

> **文档结束**。本路线图将 Poker Suite 从一个简单的 Web 计算器，逐步进化为全球领先的开放扑克智能平台。每个 Phase 都有明确的里程碑、量化指标和退出条件，确保资源高效利用。