# Poker Suite — 系统架构设计文档 (v1.0)

> **设计日期**: 2026-06-17
> **设计范围**: 从零重新设计 Texas Hold'em 工具生态
> **设计目标**: Calculator · Engine · Solver · Range · Trainer · Database · Parser · API · SDK · CLI · Web · Desktop · MCP · Agent

---

## 一、架构总览

### 1.1 设计哲学

1. **性能优先**: 核心计算路径使用 Rust + SIMD，目标单次牌型评估 < 10ns
2. **一次编写，到处运行**: Rust Core 编译为 WASM（Web）+ 原生库（Desktop/CLI）
3. **分层解耦**: 每一层只依赖下层接口，不依赖具体实现
4. **协议开放**: 核心能力通过 MCP / REST / gRPC 开放，AI Agent 可直接调用
5. **渐进增强**: 基础功能（Calculator）开箱即用，高级功能（Solver）按需加载

### 1.2 分层架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: APPLICATIONS                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐       │
│  │   Web    │ │ Desktop  │ │   CLI    │ │   MCP    │ │    Agent     │       │
│  │  (PWA)   │ │ (Tauri)  │ │  (Rust)  │ │  Server  │ │  (ReAct+RAG) │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘       │
│       │            │            │            │              │               │
│       └────────────┴────────────┴────────────┴──────────────┘               │
│                          │                                                  │
│  LAYER 3: SDK & API      ↓                                                  │
│  ┌──────────────────────────────────────────────────────────┐               │
│  │  JS/TS SDK  │  Python SDK  │  REST API  │  GraphQL  │ gRPC │              │
│  │  (npm/pypi) │  (pip)       │  (/v1)     │  (/ql)    │      │              │
│  └─────────────┴──────────────┴────────────┴───────────┴──────┘               │
│                          │                                                  │
│  LAYER 2: DOMAIN SERVICES  ↓                                                │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐           │
│  │Calculator│ │  Solver  │ │  Range  │ │ Trainer  │ │   Parser   │           │
│  │ (Equity) │ │  (CFR)   │ │ (Algebra)│ │  (Drill) │ │ (HH Parse) │           │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ └────┬─────┘ └─────┬──────┘           │
│       │            │            │           │             │                  │
│       └────────────┴────────────┴───────────┴─────────────┘                  │
│                          │                                                  │
│  LAYER 1: CORE ENGINE    ↓                                                  │
│  ┌────────────────────────────────────────────────────────────┐              │
│  │  Evaluator  │  Equity-MC  │  Range-Ops  │  CFR-Engine  │  Tree  │          │
│  │  (PH Hash)  │  (SIMD)     │  (Bitmask)  │  (DCFR)      │  (Abst)│          │
│  └─────────────┴─────────────┴─────────────┴──────────────┴────────┘          │
│                          │                                                  │
│  LAYER 0: INFRASTRUCTURE ↓                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐        │
│  │ SQLite   │ │ DuckDB   │ │  OPFS    │ │ EventBus │ │   Cache      │        │
│  │ (Local)  │ │ (Analytic)│ │ (Browser)│ │ (Pub/Sub)│ │ (LRU/Mem)    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 技术栈选型

| 层级 | 组件 | 技术选型 | 理由 |
|------|------|----------|------|
| Core Engine | 牌型评估 | Rust + Perfect Hash | < 10ns/hand，WASM 体积小 (~100KB) |
| Core Engine | SIMD 计算 | Rust `std::simd` / `packed_simd` | 跨平台 SIMD，自动向量化 |
| Core Engine | 博弈树 | Rust | 内存安全 + 零成本抽象 |
| SDK | JS/TS | TypeScript 5.x | 类型安全，生态成熟 |
| SDK | Python | Python 3.11+ | 数据科学生态 |
| Web App | 框架 | React 19 + Vite | 性能 + 开发体验 |
| Web App | WASM 绑定 | `wasm-bindgen` + `ts-rs` | 自动生成 TS 类型 |
| Web App | 状态管理 | Zustand | 轻量，支持持久化 |
| Web App | 图表 | D3.js / ECharts | 范围可视化、GTO 树 |
| Desktop | 框架 | Tauri v2 | 3-15MB 安装包，原生 WebView |
| Desktop | 存储 | SQLite (rusqlite) | 本地文件级持久化 |
| CLI | 框架 | `clap` + `indicatif` | Rust 生态最佳 |
| API | 协议 | REST + gRPC | 外部用 REST，内部用 gRPC |
| API | 文档 | OpenAPI 3.1 + `llms.txt` | AI 友好 |
| MCP | 框架 | `fastmcp` (Python) 或 Rust SDK | 协议标准化 |
| Agent | 框架 | LangGraph + MCP Client | ReAct 循环 + 工具调用 |
| Database | 本地 | SQLite + DuckDB WASM | 关系数据 + OLAP |
| Database | 浏览器 | OPFS + SQLite WASM | 大文件持久化 |
| Monorepo | 工具 | pnpm workspace + Turborepo | 缓存 + 并行构建 |
| CI/CD | 平台 | GitHub Actions | 免费 + 生态 |

---

## 二、目录结构

```
poker-suite/
├── .github/
│   ├── workflows/                    # CI/CD 工作流
│   │   ├── ci.yml                    # 持续集成（测试 + Lint + 构建）
│   │   ├── release.yml               # 自动发布（多平台 binary + npm）
│   │   └── docs.yml                  # 文档站点部署
│   ├── ISSUE_TEMPLATE/               # Issue 模板
│   ├── PULL_REQUEST_TEMPLATE.md      # PR 模板
│   └── CODE_OF_CONDUCT.md            # 行为准则
│
├── Cargo.toml                        # Rust workspace 定义
├── pnpm-workspace.yaml               # pnpm workspace 定义
├── turbo.json                        # Turborepo 管道配置
├── package.json                      # 根 package.json (devDependencies)
├── LICENSE                           # MIT / AGPL 双许可
├── CHANGELOG.md                      # 变更日志
├── CONTRIBUTING.md                   # 贡献指南
├── README.md                         # 项目总览
│
├── crates/                           # ─────── RUST 核心库 ───────
│   ├── Cargo.toml                    # crates 级 workspace
│   │
│   ├── poker-types/                  # 共享数据类型 & 序列化
│   │   ├── src/
│   │   │   ├── lib.rs                # 根模块
│   │   │   ├── card.rs               # Card, Suit, Rank
│   │   │   ├── hand.rs               # Hand, HandRanking
│   │   │   ├── board.rs              # Board, Street
│   │   │   ├── range.rs              # Range, RangeMatrix
│   │   │   ├── action.rs             # Action, StreetAction
│   │   │   ├── player.rs             # Player, Position, Stack
│   │   │   ├── game.rs               # GameType, BettingStructure
│   │   │   ├── error.rs              # PokerError, Result<T>
│   │   │   └── serde_impl.rs         # serde Serialize/Deserialize
│   │   └── Cargo.toml
│   │
│   ├── poker-eval/                   # 牌型评估引擎
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── evaluator.rs          # 核心评估器接口
│   │   │   ├── ph_evaluator.rs       # Perfect Hash 实现
│   │   │   ├── tpt_evaluator.rs      # Two Plus Two 实现 (备选)
│   │   │   ├── lookup_tables/        # 预计算查找表
│   │   │   │   ├── ph_table.bin      # Perfect Hash 表 (~100KB)
│   │   │   │   └── flush_table.bin   # 同花查找表
│   │   │   └── bench.rs              # 基准测试
│   │   └── Cargo.toml
│   │
│   ├── poker-equity/                 # 胜率 / 权益计算
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── equity_calculator.rs  # 主计算器接口
│   │   │   ├── exact_enumeration.rs  # 精确枚举实现
│   │   │   ├── monte_carlo.rs        # 蒙特卡洛模拟
│   │   │   ├── simd_batch.rs         # SIMD 批量评估
│   │   │   ├── matchup.rs            # Hand vs Hand / Range vs Range
│   │   │   ├── multiway.rs           # 多人底池计算
│   │   │   ├── progress.rs           # 计算进度回调
│   │   │   └── bench.rs
│   │   └── Cargo.toml
│   │
│   ├── poker-range/                  # 范围代数运算
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── range_set.rs          # 1326-bit 范围表示
│   │   │   ├── range_ops.rs          # 并/交/补/差运算
│   │   │   ├── range_parser.rs       # 文本解析 ("AA,AKs,T5o+")
│   │   │   ├── range_formatter.rs    # 文本格式化输出
│   │   │   ├── weight.rs             # 加权范围 (策略概率)
│   │   │   ├── filter.rs             # 条件过滤 (听牌/成牌等)
│   │   │   └── matrix.rs             # 13×13 矩阵表示
│   │   └── Cargo.toml
│   │
│   ├── poker-solver/                 # CFR/DCFR Solver
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── tree/
│   │   │   │   ├── builder.rs        # 博弈树构建器
│   │   │   │   ├── node.rs           # 树节点 (Action/Chance/Terminal)
│   │   │   │   ├── abstraction.rs    # 抽象化策略
│   │   │   │   └── isomorphism.rs    # 同构压缩
│   │   │   ├── cfr/
│   │   │   │   ├── cfr_base.rs       # 基础 CFR
│   │   │   │   ├── dcfr.rs           # Discounted CFR
│   │   │   │   ├── cfr_plus.rs       # CFR+
│   │   │   │   └── mccfr.rs          # Monte Carlo CFR
│   │   │   ├── strategy.rs           # 策略表示与存储
│   │   │   ├── exploitability.rs     # 可利用度计算
│   │   │   └── config.rs             # Solver 配置
│   │   └── Cargo.toml
│   │
│   ├── poker-parser/                 # 手牌历史解析器
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── lexer.rs              # 通用 Lexer
│   │   │   ├── ast.rs                # 抽象语法树定义
│   │   │   ├── parsers/              # 各平台解析器
│   │   │   │   ├── mod.rs            # Parser 注册表
│   │   │   │   ├── pokerstars.rs     # PokerStars 格式
│   │   │   │   ├── ggpoker.rs        # GG Poker 格式
│   │   │   │   ├── partypoker.rs     # PartyPoker 格式
│   │   │   │   └── ignition.rs       # Ignition/Bovada 格式
│   │   │   ├── stream_parser.rs      # 流式/增量解析
│   │   │   └── detector.rs           # 自动格式检测
│   │   └── Cargo.toml
│   │
│   ├── poker-trainer/                # 训练引擎
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── drill.rs              # 练习模式 (范围识别/决策)
│   │   │   ├── scenario.rs           # 场景生成器
│   │   │   ├── scoring.rs            # 评分系统
│   │   │   ├── spaced_repetition.rs  # 间隔重复算法
│   │   │   └── progress.rs           # 学习进度追踪
│   │   └── Cargo.toml
│   │
│   └── poker-core/                   # 统一 Facade Crate
│       ├── src/
│       │   ├── lib.rs                # 重新导出所有子 crate
│       │   ├── prelude.rs            # 常用导入
│       │   └── wasm_bindings.rs      # WASM 统一绑定入口
│       └── Cargo.toml
│
├── packages/                         # ─────── TYPESCRIPT 包 ───────
│   ├── @poker-suite/
│   │   ├── types/
│   │   │   ├── src/
│   │   │   │   ├── index.ts          # 类型导出
│   │   │   │   ├── card.ts           # Card 类型
│   │   │   │   ├── range.ts          # Range 类型
│   │   │   │   ├── game.ts           # Game 类型
│   │   │   │   ├── api.ts            # API 请求/响应类型
│   │   │   │   └── engine.ts         # 引擎接口类型
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── engine-wasm/              # WASM 绑定包
│   │   │   ├── src/
│   │   │   │   ├── index.ts          # 导出 WASM 初始化
│   │   │   │   ├── evaluator.ts      # 牌型评估绑定
│   │   │   │   ├── equity.ts         # 权益计算绑定
│   │   │   │   ├── range.ts          # 范围运算绑定
│   │   │   │   └── worker.ts         # Web Worker 封装
│   │   │   ├── wasm/                 # wasm-pack 输出
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── sdk/                      # JavaScript/TypeScript SDK
│   │   │   ├── src/
│   │   │   │   ├── index.ts          # SDK 入口
│   │   │   │   ├── client.ts         # HTTP Client
│   │   │   │   ├── engine.ts         # 本地引擎调用封装
│   │   │   │   ├── range.ts          # Range 工具
│   │   │   │   ├── hand-history.ts   # 手牌历史管理
│   │   │   │   └── utils.ts          # 工具函数
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   ├── ui-components/            # 共享 UI 组件库
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Card.tsx      # 扑克牌组件
│   │   │   │   │   ├── CardSelector.tsx    # 选牌器
│   │   │   │   │   ├── RangeMatrix.tsx     # 范围矩阵
│   │   │   │   │   ├── RangeSlider.tsx     # 范围滑条
│   │   │   │   │   ├── EquityBar.tsx       # 胜率条
│   │   │   │   │   ├── ActionButton.tsx    # 行动按钮
│   │   │   │   │   ├── HandHistoryTable.tsx # 手牌历史表
│   │   │   │   │   ├── GtoTreeViz.tsx      # GTO 树可视化
│   │   │   │   │   └── BankrollChart.tsx   # 资金曲线图
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useEquity.ts        # 胜率计算 Hook
│   │   │   │   │   ├── useRange.ts         # 范围操作 Hook
│   │   │   │   │   └── useStorage.ts       # 本地存储 Hook
│   │   │   │   └── index.ts
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   └── mcp-server/               # MCP Server 实现
│   │       ├── src/
│   │       │   ├── index.ts          # Server 入口
│   │       │   ├── server.ts         # MCP Server 核心
│   │       │   ├── tools/
│   │       │   │   ├── equity.ts     # 胜率计算工具
│   │       │   │   ├── range.ts      # 范围查询工具
│   │       │   │   ├── solver.ts     # Solver 查询工具
│   │       │   │   ├── trainer.ts    # 训练工具
│   │       │   │   └── parser.ts     # 手牌解析工具
│   │       │   ├── resources/
│   │       │   │   ├── strategy.ts   # 策略资源
│   │       │   │   └── hand-db.ts    # 手牌数据库资源
│   │       │   └── prompts/
│   │       │       ├── preflop.md    # 翻前策略提示模板
│   │       │       └── postflop.md   # 翻后策略提示模板
│   │       ├── package.json
│   │       └── tsconfig.json
│
├── apps/                             # ─────── 应用层 ───────
│   ├── web/                          # PWA Web 应用
│   │   ├── src/
│   │   │   ├── main.tsx              # 应用入口
│   │   │   ├── App.tsx               # 根组件
│   │   │   ├── routes/
│   │   │   │   ├── CalculatorPage.tsx    # 计算器页面
│   │   │   │   ├── RangePage.tsx         # 范围分析页面
│   │   │   │   ├── SolverPage.tsx        # Solver 页面
│   │   │   │   ├── TrainerPage.tsx       # 训练页面
│   │   │   │   ├── DatabasePage.tsx      # 数据库页面
│   │   │   │   ├── ImportPage.tsx        # 导入页面
│   │   │   │   └── SettingsPage.tsx      # 设置页面
│   │   │   ├── stores/
│   │   │   │   ├── useCalculatorStore.ts # 计算器状态
│   │   │   │   ├── useRangeStore.ts      # 范围状态
│   │   │   │   ├── useSessionStore.ts    # 会话状态
│   │   │   │   └── useSettingsStore.ts   # 设置状态
│   │   │   ├── workers/
│   │   │   │   └── engine.worker.ts      # 引擎 Web Worker
│   │   │   ├── i18n/                       # 国际化
│   │   │   │   ├── index.ts
│   │   │   │   └── locales/
│   │   │   │       ├── zh-CN.json
│   │   │   │       ├── en-US.json
│   │   │   │       ├── ja-JP.json
│   │   │   │       ├── ko-KR.json
│   │   │   │       ├── es-ES.json
│   │   │   │       ├── fr-FR.json
│   │   │   │       ├── de-DE.json
│   │   │   │       ├── pt-BR.json
│   │   │   │       ├── ru-RU.json
│   │   │   │       └── it-IT.json
│   │   │   └── sw/                     # Service Worker
│   │   │       ├── sw.ts
│   │   │       └── manifest.json
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── desktop/                      # Tauri 桌面应用
│   │   ├── src/                      # Web 前端 (复用 apps/web)
│   │   │   └── main.tsx
│   │   ├── src-tauri/                # Rust Tauri 后端
│   │   │   ├── src/
│   │   │   │   ├── main.rs           # Tauri 入口
│   │   │   │   ├── commands/         # IPC 命令
│   │   │   │   │   ├── engine.rs     # 引擎调用
│   │   │   │   │   ├── storage.rs    # 文件存储
│   │   │   │   │   └── solver.rs     # Solver 调用
│   │   │   │   └── error.rs          # 错误处理
│   │   │   ├── Cargo.toml            # 依赖 poker-core crate
│   │   │   └── tauri.conf.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── cli/                          # 命令行工具
│       ├── src/
│       │   ├── main.rs               # CLI 入口
│       │   ├── commands/
│       │   │   ├── equity.rs         # equity 子命令
│       │   │   ├── range.rs          # range 子命令
│       │   │   ├── solve.rs          # solve 子命令
│       │   │   ├── parse.rs          # parse 子命令
│       │   │   ├── train.rs          # train 子命令
│       │   │   └── db.rs             # db 子命令
│       │   └── output/
│       │       ├── table.rs          # 表格输出格式化
│       │       └── chart.rs          # ASCII 图表输出
│       ├── Cargo.toml                # 依赖 poker-core crate
│       └── README.md
│
├── api/                              # ─────── 服务端 API ───────
│   ├── proto/                        # gRPC Protobuf 定义
│   │   ├── poker/
│   │   │   ├── evaluator.proto       # 评估服务
│   │   │   ├── equity.proto          # 权益服务
│   │   │   ├── range.proto           # 范围服务
│   │   │   ├── solver.proto          # Solver 服务
│   │   │   └── common.proto          # 公共类型
│   │   └── buf.yaml                  # Buf 配置
│   │
│   ├── openapi/                      # OpenAPI 规范
│   │   ├── openapi.yaml              # 主规范文件
│   │   └── schemas/                  # 子 Schema 文件
│   │
│   └── server/                       # API 服务端实现 (Rust + Axum)
│       ├── src/
│       │   ├── main.rs               # 服务端入口
│       │   ├── routes/
│       │   │   ├── mod.rs
│       │   │   ├── equity.rs         # /v1/equity/*
│       │   │   ├── range.rs          # /v1/range/*
│       │   │   ├── solver.rs         # /v1/solver/*
│       │   │   ├── parser.rs         # /v1/parse/*
│       │   │   └── health.rs         # /health
│       │   ├── grpc/
│       │   │   └── services.rs       # gRPC 服务实现
│       │   ├── middleware/
│       │   │   ├── auth.rs           # 认证中间件
│       │   │   ├── rate_limit.rs     # 限流中间件
│       │   │   └── cors.rs           # CORS 中间件
│       │   └── error.rs              # API 错误统一处理
│       ├── Cargo.toml
│       └── Dockerfile
│
├── agent/                            # ─────── AI Agent ───────
│   ├── src/
│   │   ├── main.py                   # Agent 入口
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── router.py             # 意图路由
│   │   │   ├── memory.py             # 记忆系统
│   │   │   ├── rag.py                # RAG 检索
│   │   │   └── react.py              # ReAct 循环
│   │   ├── knowledge/
│   │   │   ├── strategy/             # 策略知识库
│   │   │   │   ├── preflop.md
│   │   │   │   ├── postflop.md
│   │   │   │   └── brm.md
│   │   │   └── embeddings/           # 预计算向量
│   │   └── tools/
│   │       ├── mcp_client.py         # MCP Client 封装
│   │       └── definitions.py        # 工具定义
│   ├── requirements.txt
│   └── Dockerfile
│
├── tests/                            # ─────── 集成测试 ───────
│   ├── e2e/                          # 端到端测试 (Playwright)
│   ├── integration/                  # 集成测试
│   │   ├── engine/                   # 引擎集成测试
│   │   ├── api/                      # API 集成测试
│   │   └── parser/                   # 解析器集成测试
│   └── fixtures/                     # 测试数据
│       ├── hands/                    # 样本手牌历史
│       ├── ranges/                   # 样本范围
│       └── strategies/               # 样本策略文件
│
├── docs/                             # ─────── 文档 ───────
│   ├── architecture/                 # 架构文档
│   │   ├── overview.md               # 架构总览
│   │   ├── engine.md                 # 引擎设计
│   │   ├── solver.md                 # Solver 设计
│   │   ├── range.md                  # 范围系统设计
│   │   ├── api.md                    # API 文档
│   │   └── sdk.md                    # SDK 文档
│   ├── tutorials/                    # 教程
│   ├── api-reference/                # API 参考 (自动生成)
│   └── docusaurus.config.js          # 文档站点配置
│
└── tools/                            # ─────── 构建工具 ───────
    ├── generate-sdk/                 # SDK 自动生成
    ├── benchmark/                    # 性能基准测试
    └── release/                      # 发布脚本
```

---

## 三、模块关系

### 3.1 依赖关系图

```
                          ┌─────────────────┐
                          │   Applications  │
                          │  (Web/Desktop)  │
                          └────────┬────────┘
                                   │ depends on
                          ┌────────▼────────┐
                          │      SDK        │
                          │  (@poker-suite) │
                          └────────┬────────┘
                                   │ depends on
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
     │   engine-wasm   │  │   MCP Server   │  │   API Client   │
     │  (WASM bindings)│  │  (@poker-suite)│  │  (HTTP/gRPC)   │
     └────────┬────────┘  └───────┬────────┘  └───────┬────────┘
              │                   │                   │
              │         ┌─────────┴───────────────────┘
              │         │
     ┌────────▼─────────▼────────┐
     │      poker-core (Rust)    │  ← 统一 Facade
     │  ┌─────┬─────┬─────┬─────┐│
     │  │eval │equity│range│parser││
     │  └─────┴─────┴─────┴─────┘│
     │         │                 │
     │    ┌────▼────┐            │
     │    │  types  │            │
     │    └─────────┘            │
     └───────────────────────────┘
              │
     ┌────────▼────────┐
     │   Infrastructure │
     │  (SQLite/DuckDB) │
     └──────────────────┘
```

### 3.2 模块间接口契约

#### 3.2.1 Core Engine ↔ SDK/WASM 接口

```rust
// crates/poker-core/src/wasm_bindings.rs

use poker_types::*;
use poker_eval::*;
use poker_equity::*;
use poker_range::*;

#[wasm_bindgen]
pub struct WasmEngine {
    evaluator: Evaluator,
}

#[wasm_bindgen]
impl WasmEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self { ... }

    /// 评估一手牌（7张）
    pub fn evaluate_7cards(&self, cards: &[u8]) -> HandRanking { ... }

    /// 计算 Equity（支持多人底池）
    pub fn calculate_equity(
        &self,
        hero_hand: &[u8],
        opponent_ranges: Vec<JsRange>,  // 对手范围数组
        board: &[u8],
        iterations: u32,
    ) -> EquityResult { ... }

    /// 范围运算
    pub fn range_union(a: &str, b: &str) -> String { ... }
    pub fn range_intersection(a: &str, b: &str) -> String { ... }
    pub fn range_complement(range: &str) -> String { ... }

    /// 解析手牌历史
    pub fn parse_hand_history(text: &str) -> Result<JsHandHistory, JsError> { ... }
}
```

#### 3.2.2 MCP Server 工具接口

```typescript
// packages/@poker-suite/mcp-server/src/tools/equity.ts

import { z } from "zod";

export const equityTool = {
  name: "poker_calculate_equity",
  description: "Calculate equity (win probability) for a poker hand against opponent ranges",
  parameters: z.object({
    hero_hand: z.string().describe("Hero's hand, e.g., 'AsKh' or 'AKs'"),
    opponent_ranges: z.array(z.string()).describe(
      "Opponent hand ranges, e.g., ['JJ+', 'AQs+', 'KQs']"
    ),
    board: z.string().optional().describe(
      "Community cards, e.g., 'Ts9d2h'"
    ),
    iterations: z.number().min(100).max(1000000).default(10000)
      .describe("Number of Monte Carlo simulations"),
  }),
  handler: async (params) => {
    // 调用本地引擎或 WASM
    const result = await engine.calculateEquity(params);
    return {
      equity: result.equity,
      tie_probability: result.tie,
      win_probability: result.win,
      details: result.breakdown,
    };
  },
};

export const rangeQueryTool = {
  name: "poker_query_range",
  description: "Query recommended preflop range for a given position",
  parameters: z.object({
    position: z.enum(["UTG", "MP", "CO", "BTN", "SB", "BB"]),
    action: z.enum(["open", "vs_3bet", "vs_4bet", "bb_defend"]).optional(),
    stack_depth: z.number().min(10).max(250).optional()
      .describe("Stack depth in big blinds"),
  }),
  handler: async (params) => { ... },
};

export const handHistoryParseTool = {
  name: "poker_parse_hand_history",
  description: "Parse poker hand history text from any supported site",
  parameters: z.object({
    text: z.string().describe("Raw hand history text"),
    site: z.enum(["auto", "pokerstars", "ggpoker", "partypoker", "ignition"])
      .default("auto"),
  }),
  handler: async (params) => { ... },
};

export const gtoStrategyTool = {
  name: "poker_query_gto_strategy",
  description: "Query GTO strategy for a specific spot",
  parameters: z.object({
    position: z.string(),
    board: z.string(),
    hand: z.string(),
    pot_size: z.number(),
    stack_to_pot_ratio: z.number(),
  }),
  handler: async (params) => { ... },
};

export const trainingDrillTool = {
  name: "poker_training_drill",
  description: "Generate a training drill for a specific skill",
  parameters: z.object({
    skill: z.enum(["preflop_ranges", "equity_estimation", "pot_odds", "hand_reading"]),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
    count: z.number().min(1).max(50).default(10),
  }),
  handler: async (params) => { ... },
};
```

#### 3.2.3 REST API 接口

```yaml
# api/openapi/openapi.yaml (核心端点)

openapi: 3.1.0
info:
  title: Poker Suite API
  version: 1.0.0
  description: |
    RESTful API for poker analysis tools.
    Also available via MCP Server and gRPC.

paths:
  /v1/equity:
    post:
      operationId: calculateEquity
      summary: Calculate hand equity vs opponent ranges
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                hero_hand: { type: string, example: "AsKh" }
                opponent_ranges:
                  type: array
                  items: { type: string }
                  example: ["JJ+", "AQs+", "KQs"]
                board: { type: string, example: "Ts9d2h", nullable: true }
                dead_cards: { type: string, nullable: true }
                iterations: { type: integer, default: 10000, minimum: 100, maximum: 1000000 }
                exact: { type: boolean, default: false }
      responses:
        200:
          description: Equity calculation result
          content:
            application/json:
              schema:
                type: object
                properties:
                  equity: { type: number, description: "Hero's equity (0-1)" }
                  win: { type: number }
                  tie: { type: number }
                  breakdown:
                    type: array
                    items:
                      type: object
                      properties:
                        opponent_range: { type: string }
                        equity_vs: { type: number }

  /v1/range/parse:
    post:
      operationId: parseRange
      summary: Parse a range string into structured data
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                range: { type: string, example: "AA,AKs,AQo+,T5s-98s" }
      responses:
        200:
          description: Parsed range with 1326 combinations

  /v1/range/operations:
    post:
      operationId: rangeOperations
      summary: Perform set operations on ranges
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                operation: { type: string, enum: [union, intersection, difference, complement] }
                ranges: { type: array, items: { type: string } }
      responses:
        200:
          description: Result range string

  /v1/parser/hands:
    post:
      operationId: parseHandHistory
      summary: Parse raw hand history text
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                text: { type: string }
                site: { type: string, enum: [auto, pokerstars, ggpoker, partypoker, ignition], default: auto }
      responses:
        200:
          description: Parsed hands array

  /v1/solver/spots:
    get:
      operationId: listSolverSpots
      summary: List available GTO solver spots
      parameters:
        - name: position
          in: query
          schema: { type: string }
        - name: board
          in: query
          schema: { type: string }
      responses:
        200:
          description: Available spots

  /health:
    get:
      operationId: healthCheck
      responses:
        200:
          description: Service is healthy
```

---

## 四、核心子系统设计

### 4.1 Calculator (胜率/权益计算器)

```
┌─────────────────────────────────────────────┐
│           Equity Calculator                 │
│  ┌─────────────────────────────────────┐    │
│  │  Input: Hero Hand + Opp Ranges +    │    │
│  │         Board + Dead Cards          │    │
│  └──────────────────┬──────────────────┘    │
│                     │                       │
│         ┌───────────┴───────────┐           │
│         ▼                       ▼           │
│  ┌──────────────┐      ┌──────────────┐    │
│  │  Small Case? │      │  Large Case? │    │
│  │  (combo <=   │      │  (combo >    │    │
│  │   threshold) │      │   threshold) │    │
│  └──────┬───────┘      └──────┬───────┘    │
│         │                     │             │
│         ▼                     ▼             │
│  ┌──────────────┐      ┌──────────────┐    │
│  │ Exact Enum   │      │ Monte Carlo  │    │
│  │ C(n,k) combos│      │ SIMD Batch   │    │
│  │ 100% accurate│      │ Parallel eval│    │
│  └──────┬───────┘      └──────┬───────┘    │
│         │                     │             │
│         └───────────┬─────────┘             │
│                     ▼                       │
│  ┌─────────────────────────────────────┐    │
│  │  Output: Equity % + Win/Tie/Loss    │    │
│  │         + Breakdown by opponent     │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**关键设计决策**:
- 阈值自动判断：组合数 ≤ 200万用精确枚举，否则 Monte Carlo
- SIMD 批量评估：一次评估 32/64 组 matchup
- 多人底池支持：支持 2-6 个对手，每个对手可设独立范围
- 进度回调：计算过程中实时返回进度百分比

### 4.2 Engine (牌型评估引擎)

```
┌─────────────────────────────────────────────┐
│         Hand Evaluator (PH Hash)            │
│                                             │
│  Input: [Card] × 5 or 7                     │
│     │                                       │
│     ▼                                       │
│  ┌─────────────────────────────────────┐    │
│  │  7-card: Enumerate C(7,5)=21 combos │    │
│  │  → evaluate each 5-card combo       │    │
│  │  → take max ranking                 │    │
│  └─────────────────────────────────────┘    │
│     │                                       │
│     ▼                                       │
│  ┌─────────────────────────────────────┐    │
│  │  5-card Perfect Hash Lookup         │    │
│  │                                     │    │
│  │  Step 1: Card → bit mask (52-bit)   │    │
│  │  Step 2: Check flush (suit bits)    │    │
│  │  Step 3: If flush → flush hash      │    │
│  │  Step 4: Else → unique hash lookup  │    │
│  │  Step 5: Return rank (0-7462)       │    │
│  └─────────────────────────────────────┘    │
│     │                                       │
│     ▼                                       │
│  Output: HandRanking { rank, category, kickers }
└─────────────────────────────────────────────┘
```

### 4.3 Solver (CFR/DCFR)

```
┌─────────────────────────────────────────────────────┐
│              CFR Solver Architecture                │
│                                                     │
│  ┌─────────────┐    ┌─────────────┐               │
│  │ Tree Builder│───→│ Game Tree   │               │
│  │             │    │ (Memory)    │               │
│  └─────────────┘    └──────┬──────┘               │
│                            │                       │
│              ┌─────────────┼─────────────┐         │
│              ▼             ▼             ▼         │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│  │  CFR Base    │ │   CFR+       │ │   DCFR     ││
│  │  (Standard)  │ │   (Optimized)│ │   (Best)   ││
│  └──────┬───────┘ └──────┬───────┘ └─────┬──────┘│
│         │                │               │        │
│         └────────────────┴───────────────┘        │
│                          │                        │
│                          ▼                        │
│  ┌─────────────────────────────────────────────┐ │
│  │  Iteration Loop                             │ │
│  │  ├── Forward: reach probabilities           │ │
│  │  ├── Backward: utility + regret             │ │
│  │  ├── Update: strategy (regret matching)     │ │
│  │  └── Check: exploitability / convergence    │ │
│  └─────────────────────────────────────────────┘ │
│                          │                        │
│                          ▼                        │
│  Output: Strategy Profile (Nash Equilibrium approx)│
└─────────────────────────────────────────────────────┘
```

### 4.4 Range (范围系统)

```
┌─────────────────────────────────────────────────┐
│              Range System                       │
│                                                 │
│  文本表示        内部表示         可视化        │
│  ─────────      ─────────      ─────────       │
│  "AA,AKs+"  →  1326-bit mask  →  13×13 矩阵   │
│                                                 │
│  运算:                                          │
│  • Union:        mask_a | mask_b               │
│  • Intersection: mask_a & mask_b               │
│  • Difference:   mask_a & !mask_b              │
│  • Complement:   !mask_a                       │
│  • Filter:       mask & condition_mask         │
│                                                 │
│  条件过滤:                                      │
│  • 同花听牌: 4 cards to flush                  │
│  • 顺子听牌: 4 cards to straight               │
│  • 超对: pocket pair > top board card          │
│  • 顶对: paired top board card                 │
└─────────────────────────────────────────────────┘
```

### 4.5 Trainer (训练系统)

```
┌─────────────────────────────────────────────────┐
│              Training System                    │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Drill   │  │ Scenario │  │  Review  │     │
│  │  Mode    │  │  Mode    │  │  Mode    │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │            │
│       └─────────────┼─────────────┘            │
│                     ▼                           │
│  ┌─────────────────────────────────────┐       │
│  │    Spaced Repetition Engine         │       │
│  │  (SM-2 / FSRS algorithm)            │       │
│  │                                     │       │
│  │  ┌─────────┐  ┌─────────┐          │       │
│  │  │  Card   │  │  Card   │  ...     │       │
│  │  │(Question│  │(Question│          │       │
│  │  │ + Answer│  │ + Answer│          │       │
│  │  │ + Meta) │  │ + Meta) │          │       │
│  │  └─────────┘  └─────────┘          │       │
│  └─────────────────────────────────────┘       │
│                     │                           │
│                     ▼                           │
│  ┌─────────────────────────────────────┐       │
│  │    Progress Analytics               │       │
│  │  • Accuracy by position             │       │
│  │  • Accuracy by hand type            │       │
│  │  • Reaction time trends             │       │
│  │  • Weakness identification          │       │
│  └─────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

### 4.6 Parser (手牌历史解析器)

```
┌─────────────────────────────────────────────────┐
│           Hand History Parser                   │
│                                                 │
│  Raw Text                                       │
│     │                                           │
│     ▼                                           │
│  ┌─────────────┐                                │
│  │ Auto-Detect │  → 路由到对应解析器            │
│  │  (Header)   │                                │
│  └──────┬──────┘                                │
│         │                                       │
│  ┌──────┴──────────────────────────────┐        │
│  ▼                                      ▼        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │PokerStars│  │ GG Poker │  │PartyPoker│  ... │
│  │  Parser  │  │  Parser  │  │  Parser  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │            │
│       └─────────────┴─────────────┘            │
│                     │                           │
│                     ▼                           │
│  ┌─────────────────────────────────────┐       │
│  │  Unified HandHistory Model          │       │
│  │                                     │       │
│  │  • Metadata (site, hand_id, time)   │       │
│  │  • Players (seat, stack, position)  │       │
│  │  • Actions (street, player, action) │       │
│  │  • Board (flop, turn, river)        │       │
│  │  • Results (winners, amounts)       │       │
│  └─────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

### 4.7 Database (存储层)

```
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Desktop    │  │    Server    │      │
│  │  (WASM)      │  │  (Native)    │  │   (Cloud)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SQLite WASM  │  │ SQLite       │  │ PostgreSQL   │      │
│  │ + OPFS       │  │ (local file) │  │ (cloud)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         └─────────────────┴─────────────────┘              │
│                           │                                │
│                           ▼                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Unified Storage Interface                         │   │
│  │  • save_hand(hand: HandHistory)                    │   │
│  │  • query_hands(filter: HandFilter)                 │   │
│  │  • get_stats(player: string, timeframe)            │   │
│  │  • save_session(session: Session)                  │   │
│  │  • get_bankroll_history()                          │   │
│  └────────────────────────────────────────────────────┘   │
│                           │                                │
│                           ▼                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Schema                                            │   │
│  │  • hands (手牌历史)                                │   │
│  │  • sessions (会话)                                 │   │
│  │  • players (玩家统计)                              │   │
│  │  • strategies (保存的策略/范围)                    │   │
│  │  • training_cards (训练卡片)                       │   │
│  │  • bankroll (资金历史)                             │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.8 MCP Server

```
┌─────────────────────────────────────────────────────────────┐
│                  MCP Server Architecture                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MCP Host (Claude Desktop / Cursor / Custom)        │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │ JSON-RPC 2.0                    │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │              MCP Client                             │   │
│  │  • Tool Discovery                                   │   │
│  │  • Tool Invocation                                  │   │
│  │  • Resource Access                                  │   │
│  │  • Prompt Templates                                 │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │           Poker Suite MCP Server                    │   │
│  │                                                     │   │
│  │  Tools:                                             │   │
│  │  ├─ poker_calculate_equity()                        │   │
│  │  ├─ poker_query_range()                             │   │
│  │  ├─ poker_parse_hand_history()                      │   │
│  │  ├─ poker_query_gto_strategy()                      │   │
│  │  └─ poker_training_drill()                          │   │
│  │                                                     │   │
│  │  Resources:                                         │   │
│  │  ├─ strategy://preflop/utg                          │   │
│  │  ├─ strategy://postflop/dry-board                   │   │
│  │  └─ hand-db://session/2026-06-17                    │   │
│  │                                                     │   │
│  │  Prompts:                                           │   │
│  │  ├─ "Analyze this hand"                             │   │
│  │  ├─ "Review my session"                             │   │
│  │  └─ "Explain pot odds"                              │   │
│  │                                                     │   │
│  │  (Internally calls poker-core via SDK)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.9 Agent (AI Agent)

```
┌─────────────────────────────────────────────────────────────┐
│                  AI Agent Architecture                      │
│                                                             │
│  User Input (NL)                                            │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Intent Router                                    │   │
│  │     • 计算请求 → Equity Tool                         │   │
│  │     • 策略查询 → Range / GTO Tool                    │   │
│  │     • 手牌分析 → Parse + Equity + GTO                │   │
│  │     • 训练请求 → Trainer Tool                        │   │
│  │     • 闲聊 → LLM 直接回复                            │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2. ReAct Loop                                       │   │
│  │                                                      │   │
│  │  Thought → Action → Observation → Thought → ...      │   │
│  │                                                      │   │
│  │  示例:                                               │   │
│  │  T: 用户问 AKs on BTN vs 3bet                        │   │
│  │  A: 调用 range 工具查询 BTN vs 3bet 范围             │   │
│  │  O: 范围显示 AKs 是 call/4bet                        │   │
│  │  T: 需要解释为什么                                   │   │
│  │  A: 调用 equity 工具计算 AKs vs 3bet range           │   │
│  │  O: equity = 47.3%                                   │   │
│  │  T: 综合回答                                         │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. RAG Knowledge Base                               │   │
│  │                                                      │   │
│  │  查询 → 向量检索(ChromaDB) → 相关片段                │   │
│  │  → 注入 LLM 上下文 → 生成回答                        │   │
│  │                                                      │   │
│  │  知识库内容:                                         │   │
│  │  • GTO 策略文档                                      │   │
│  │  • 翻前范围表                                        │   │
│  │  • 视频教学内容                                      │   │
│  │  • 用户历史对局分析                                  │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  4. Memory System                                    │   │
│  │                                                      │   │
│  │  Hot (会话级): 当前对话、活跃工具结果                │   │
│  │  Warm (近期): 同会话检索的文档、对手模型             │   │
│  │  Cold (持久): 用户偏好、历史决策、策略更新           │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  5. Response Generation                              │   │
│  │     • 流式输出 (SSE)                                 │   │
│  │     • 结构化数据 + 自然语言解释                      │   │
│  │     • 引用来源 (可追溯)                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、数据流设计

### 5.1 核心计算数据流

```
User selects cards in Web App
         │
         ▼
┌─────────────────┐
│  UI State       │  (Zustand store)
│  holeCards,     │
│  communityCards │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Calculate      │  (Web Worker)
│  Request        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  WASM Engine    │◄────│  Local Cache    │
│  (poker-core)   │     │  (LRU: same     │
│                 │     │   board+hand)   │
└────────┬────────┘     └─────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────────┐
│ Exact │ │ Monte     │
│ Enum  │ │ Carlo     │
└───┬───┘ └─────┬─────┘
    │           │
    └─────┬─────┘
          ▼
┌─────────────────┐
│  EquityResult   │
│  {equity, win,  │
│   tie, breakdown│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UI Update      │
│  (React render) │
└─────────────────┘
```

### 5.2 手牌导入数据流

```
User drops HH file
         │
         ▼
┌─────────────────┐
│  File Reader    │  (ReadableStream)
│  (Chunked)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Web Worker     │
│  Parser Pool    │  (Parallel parsing)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AST Hand objs  │
│  (per hand)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Batch Insert   │  (Every 100 hands)
│  to SQLite/OPFS │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Progress UI    │  (Update every batch)
└─────────────────┘
```

---

## 六、接口设计规范

### 6.1 Rust Core 公共接口

```rust
// crates/poker-core/src/lib.rs

pub mod eval;
pub mod equity;
pub mod range;
pub mod parser;
pub mod trainer;
pub mod types;

/// 统一引擎入口
pub struct PokerEngine {
    evaluator: eval::Evaluator,
    equity_calc: equity::EquityCalculator,
    range_ops: range::RangeOperations,
}

impl PokerEngine {
    pub fn new() -> Self;

    // ─── 牌型评估 ───
    pub fn evaluate(&self, cards: &[Card]) -> HandRanking;
    pub fn compare(&self, a: HandRanking, b: HandRanking) -> Ordering;

    // ─── 胜率计算 ───
    pub fn equity(
        &self,
        hero: &[Card],
        villains: Vec<VillainRange>,
        board: &[Card],
        config: EquityConfig,
    ) -> EquityResult;

    // ─── 范围运算 ───
    pub fn parse_range(&self, text: &str) -> Result<Range, ParseError>;
    pub fn format_range(&self, range: &Range) -> String;
    pub fn range_equity(&self, range_a: &Range, range_b: &Range, board: &[Card]) -> EquityResult;

    // ─── 解析 ───
    pub fn parse_hand_history(&self, text: &str) -> Result<Vec<HandHistory>, ParseError>;
    pub fn detect_site(&self, text: &str) -> Option<PokerSite>;

    // ─── 训练 ───
    pub fn generate_drill(&self, config: DrillConfig) -> Drill;
    pub fn score_answer(&self, drill: &Drill, answer: &Answer) -> ScoreResult;
}

// 配置类型
pub struct EquityConfig {
    pub method: CalculationMethod,      // Exact | MonteCarlo | Auto
    pub iterations: u32,                // 默认 10000
    pub threads: u32,                   // 默认 num_cpus
    pub timeout_ms: u32,                // 默认 30000
    pub progress_callback: Option<Box<dyn Fn(f32)>>,
}

pub enum CalculationMethod {
    Exact,
    MonteCarlo,
    Auto,  // 根据组合数自动选择
}
```

### 6.2 TypeScript SDK 公共接口

```typescript
// packages/@poker-suite/sdk/src/index.ts

import { Engine, Range, EquityResult, HandHistory } from "@poker-suite/engine-wasm";

export class PokerSDK {
  private engine: Engine;
  private storage: StorageAdapter;

  constructor(options?: SDKOptions);

  // ─── 计算 ───
  async calculateEquity(params: EquityParams): Promise<EquityResult>;
  async calculateMultiwayEquity(params: MultiwayEquityParams): Promise<MultiwayEquityResult>;

  // ─── 范围 ───
  parseRange(text: string): Range;
  formatRange(range: Range): string;
  rangeUnion(a: Range, b: Range): Range;
  rangeIntersection(a: Range, b: Range): Range;
  rangeEquity(hero: Range, villain: Range, board: Card[]): Promise<EquityResult>;

  // ─── 手牌历史 ───
  async parseHandHistory(text: string, site?: PokerSite): Promise<HandHistory[]>;
  async importFromFile(file: File): Promise<ImportResult>;
  async queryHands(filter: HandFilter): Promise<HandHistory[]>;

  // ─── 训练 ───
  async generateDrill(config: DrillConfig): Promise<Drill>;
  async submitAnswer(drillId: string, answer: Answer): Promise<ScoreResult>;
  async getProgress(): Promise<LearningProgress>;

  // ─── 存储 ───
  async saveSession(session: Session): Promise<void>;
  async getBankrollHistory(): Promise<BankrollSnapshot[]>;
  async getPlayerStats(playerName: string): Promise<PlayerStats>;
}

// SDK 选项
interface SDKOptions {
  wasmUrl?: string;           // WASM 模块 URL
  apiEndpoint?: string;       // 远程 API 端点（可选）
  storage?: StorageAdapter;   // 自定义存储适配器
  locale?: string;            // 默认语言
  theme?: "dark" | "light";   // 默认主题
}
```

### 6.3 gRPC 服务定义

```protobuf
// api/proto/poker/equity.proto

syntax = "proto3";
package poker.equity;

service EquityService {
  rpc Calculate (EquityRequest) returns (EquityResponse);
  rpc CalculateStream (EquityRequest) returns (stream ProgressResponse);
  rpc BatchCalculate (BatchEquityRequest) returns (BatchEquityResponse);
}

message EquityRequest {
  repeated string hero_cards = 1;           // e.g., ["As", "Kh"]
  repeated VillainRange opponent_ranges = 2;
  repeated string board = 3;                // e.g., ["Ts", "9d", "2h"]
  string dead_cards = 4;
  uint32 iterations = 5;
  bool exact = 6;
}

message VillainRange {
  string range_text = 1;  // e.g., "JJ+,AQs+,KQs"
  float weight = 2;       // default 1.0
}

message EquityResponse {
  double equity = 1;        // 0.0 - 1.0
  double win = 2;
  double tie = 3;
  repeated MatchupBreakdown breakdown = 4;
}

message MatchupBreakdown {
  string opponent_range = 1;
  double equity_vs = 2;
  double win_vs = 3;
  double tie_vs = 4;
}

message ProgressResponse {
  uint32 completed = 1;
  uint32 total = 2;
  double current_equity = 3;  // Running estimate
}
```

---

## 七、未来扩展方式

### 7.1 水平扩展（功能维度）

```
                    ┌──────────────┐
                    │  Poker Suite │
                    │    Core      │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Hold'em  │       │ Omaha   │       │ShortDeck│
   │(NLHE)   │       │(PLO)    │       │(6+)     │
   │  ✅     │       │  Planned│       │ Planned │
   └─────────┘       └─────────┘       └─────────┘
        │
   ┌────┴──────────────────────────────────────┐
   │  Extensions (Plugin Architecture)          │
   │  ┌────────┐ ┌────────┐ ┌────────┐        │
   │  │ICM     │ │Push/Fold│ │SNG     │        │
   │  │Calc    │ │Chart   │ │Tools   │        │
   │  └────────┘ └────────┘ └────────┘        │
   │  ┌────────┐ ┌────────┐ ┌────────┐        │
   │  │HH Replayer│ │HUD    │ │Leak   │        │
   │  │         │ │Overlay│ │Finder │        │
   │  └────────┘ └────────┘ └────────┘        │
   └──────────────────────────────────────────┘
```

**扩展机制**:
- **Crate 注册表**: 新游戏类型实现 `GameVariant` trait，注册到引擎
- **WASM 插件**: 第三方扩展编译为 WASM 模块，运行时加载
- **MCP 扩展**: 外部工具通过 MCP Server 接入 Agent

### 7.2 垂直扩展（平台维度）

```
┌─────────────────────────────────────────────────────┐
│                 Platform Expansion                  │
│                                                     │
│  Current:                Planned:                   │
│  ┌────────┐             ┌────────┐                 │
│  │  Web   │             │ Mobile │  (Capacitor)     │
│  │  ✅    │             │  📋    │                  │
│  │ (PWA)  │             │ iOS/And│                  │
│  └────────┘             └────────┘                 │
│  ┌────────┐             ┌────────┐                 │
│  │ Desktop│             │ VSCode │  (Extension)     │
│  │  ✅    │             │  📋    │                  │
│  │(Tauri) │             │ Ext    │                  │
│  └────────┘             └────────┘                 │
│  ┌────────┐             ┌────────┐                 │
│  │  CLI   │             │ Discord│  (Bot)           │
│  │  ✅    │             │  📋    │                  │
│  └────────┘             └────────┘                 │
│                         ┌────────┐                 │
│                         │Telegram│  (Bot)           │
│                         │  📋    │                  │
│                         └────────┘                 │
└─────────────────────────────────────────────────────┘
```

### 7.3 生态扩展（集成维度）

```
┌─────────────────────────────────────────────────────┐
│              Ecosystem Integration                  │
│                                                     │
│  ┌────────────┐    ┌────────────┐    ┌───────────┐ │
│  │  Poker     │    │  Poker     │    │  Holdem   │ │
│  │  Tracker   │◄──►│  Snowie    │◄──►│  Manager  │ │
│  │  (HM3/PT4) │    │  (HRC)     │    │  (HM)     │ │
│  └────────────┘    └────────────┘    └───────────┘ │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │         Import / Export Adapters         │   │
│  │  • HH format conversion                  │   │
│  │  • Database migration                    │   │
│  │  • Stats sync                            │   │
│  └──────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────┐    ┌────────────┐    ┌───────────┐ │
│  │  YouTube   │    │  Twitch    │    │  Discord  │ │
│  │  (Video)   │    │  (Live)    │    │  (Chat)   │ │
│  └────────────┘    └────────────┘    └───────────┘ │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │         Content Integration              │   │
│  │  • Video timestamp → hand analysis       │   │
│  │  • Chat command → equity query           │   │
│  │  • Live stream → real-time stats         │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 7.4 版本演进路线

| 版本 | 代号 | 目标 | 核心交付 |
|------|------|------|----------|
| v0.1 | Foundation | 可运行的 Equity Calculator | `poker-eval` + `poker-equity` + Web App |
| v0.2 | Range | 范围分析与矩阵 | `poker-range` + Range Matrix UI |
| v0.3 | Parser | 手牌历史导入 | `poker-parser` + Database + Import UI |
| v0.4 | Trainer | 训练系统 | `poker-trainer` + Drill UI + Spaced Repetition |
| v0.5 | Solver | GTO Solver (基础) | `poker-solver` (DCFR, 2-player) |
| v1.0 | Suite | 完整工具生态 | SDK + API + MCP + Desktop + CLI |
| v1.1 | Multiway | 多人 Solver | 3-6 player solver support |
| v1.2 | Omaha | PLO 支持 | Omaha Hi/Lo evaluator + ranges |
| v1.5 | Agent | AI Agent | RAG + Memory + ReAct full integration |
| v2.0 | Cloud | 云服务 | Multi-tenant API + Cloud Solver |

---

## 八、构建与发布

### 8.1 构建管道 (Turborepo)

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", "pkg/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 8.2 CI/CD 流程

```
Push to main / PR
    │
    ▼
┌─────────────────┐
│ 1. Lint & Format│  (cargo fmt, clippy, eslint, prettier)
│    Check        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Rust Tests   │  (cargo test --workspace)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. WASM Build   │  (wasm-pack build)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. TS Tests     │  (vitest)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. E2E Tests    │  (Playwright)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Build Apps   │  (Web + Desktop + CLI)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Release      │  (GitHub Release + npm publish + crates.io)
└─────────────────┘
```

### 8.3 发布产物

| 产物 | 平台 | 格式 | 分发渠道 |
|------|------|------|----------|
| `poker-core` | 全平台 | Rust Crate | crates.io |
| `@poker-suite/engine-wasm` | Web | npm + WASM | npmjs.org |
| `@poker-suite/sdk` | Web/Node | npm | npmjs.org |
| `@poker-suite/ui-components` | Web | npm | npmjs.org |
| `@poker-suite/mcp-server` | Node | npm | npmjs.org |
| Poker Suite Web | Web | PWA | GitHub Pages / Vercel |
| Poker Suite Desktop | Win/Mac/Linux | Installer | GitHub Releases |
| Poker Suite CLI | Win/Mac/Linux | Binary | GitHub Releases / Homebrew |
| API Server | Linux | Docker | Docker Hub / GitHub Packages |
| Agent | Python | pip package | PyPI |

---

## 九、安全与隐私

### 9.1 数据安全

- **本地优先**: 所有计算在本地完成，手牌数据不上传
- **端到端加密**: 可选云同步时，使用 AES-256-GCM
- **OPFS 隔离**: 浏览器存储使用 Origin Private File System
- **沙箱 WASM**: WASM 模块运行在浏览器沙箱中

### 9.2 隐私设计

- **零知识架构**: 服务器不存储任何用户手牌数据
- **匿名统计**: 可选发送匿名使用统计（opt-in）
- **数据导出**: 支持完整数据导出为 JSON / SQLite
- **数据删除**: 一键清除所有本地数据

---

## 十、总结

本架构设计从零构建了一个完整的德州扑克工具生态系统，核心设计原则：

1. **Rust Core 作为单一真相源**: 所有计算逻辑集中在 Rust，通过 WASM 和原生库暴露到各平台
2. **分层解耦**: Applications → SDK → Domain Services → Core Engine → Infrastructure，每层只依赖下层接口
3. **协议开放**: 通过 REST / gRPC / MCP 将核心能力开放给 AI Agent 和第三方工具
4. **渐进增强**: 基础功能开箱即用，高级功能（Solver、Agent）按需加载
5. **多平台统一**: 一套代码库覆盖 Web / Desktop / CLI / SDK / MCP

**与当前项目的根本差异**:

| 维度 | 当前项目 | 新架构 |
|------|----------|--------|
| 语言 | 纯 JS | Rust Core + TS SDK |
| 架构 | 单文件全局变量 | 分层模块化 Monorepo |
| 计算 | 主线程阻塞 | Web Worker + WASM SIMD |
| 平台 | 仅 Web | Web + Desktop + CLI + SDK |
| AI | 13 条规则 | MCP Server + RAG Agent |
| 存储 | 无 | SQLite + DuckDB |
| 测试 | 20 个断言 | 完整单元/集成/E2E 覆盖 |
| 开源 | 无 LICENSE | MIT/AGPL + 完整社区规范 |
| 扩展 | 无 | Plugin + MCP + gRPC |
