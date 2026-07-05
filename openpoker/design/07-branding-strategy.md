# OpenPoker — 品牌升级与命名策略

> **原项目**: texas-holdem-calculator  
> **核心洞察**: "Calculator" 这个词把天花板定死了——用户看到一个计算器，不会联想到平台、生态、AI Agent  
> **新品牌**: OpenPoker  
> **设计日期**: 2026-06-17

---

## 目录

1. [为什么必须改名](#一为什么必须改名)
2. [候选名称调研矩阵](#二候选名称调研矩阵)
3. [最终推荐: OpenPoker](#三最终推荐-openpoker)
4. [品牌架构设计](#四品牌架构设计)
5. [命名空间与包管理](#五命名空间与包管理)
6. [域名与社交媒体占位](#六域名与社交媒体占位)
7. [品牌视觉系统](#七品牌视觉系统)
8. [迁移路线图](#八迁移路线图)
9. [竞品命名分析](#九竞品命名分析)

---

## 一、为什么必须改名

### 1.1 原名的问题

```
texas-holdem-calculator
│    │      │         │
│    │      │         └── 工具感太强 → 暗示"用完即走"
│    │      └──────────── 游戏类型限制 → 暗示仅限德州
│    └─────────────────── 游戏变体限制 → 暗示仅限Hold'em
└──────────────────────── 无品牌感 → 无法建立认知
```

| 问题 | 具体表现 | 后果 |
|:-----|:---------|:-----|
| **品类锁定** | "calculator" = 单一工具 | 无法扩展 Solver/AI/平台 |
| **游戏锁定** | "texas-holdem" = 一种游戏 | Omaha/Stud/短牌无法纳入 |
| **无品牌资产** | 通用描述性名称 | 无法注册商标、无法建立认知 |
| **SEO 劣势** | 关键词堆砌 | Google 视为低质量命名 |
| **传播障碍** | 太长、太难记 | 口耳相传时丢失 |
| **生态限制** | 无法形成 @brand/* 命名空间 | 子包命名混乱 |

### 1.2 好品牌名的标准

```
┌─────────────────────────────────────────────────────────────┐
│                 GREAT BRAND NAME CRITERIA                   │
│                                                             │
│  ✅ Extensible      可扩展 — 不限于单一功能/游戏            │
│  ✅ Memorable       易记忆 — 2-3 个音节，发音清晰           │
│  ✅ Ownable         可拥有 — 能注册商标，域名/社媒可用      │
│  ✅ Namespace-ready 命名空间 — 支持 @brand/* 子包体系       │
│  ✅ Meaningful      有意义 — 传达"开放+扑克"的核心价值      │
│  ✅ Short           简短 — GitHub 仓库名 / CLI 命令友好     │
│  ✅ Distinctive     独特性 — 不与知名项目冲突               │
│  ✅ Future-proof    未来感 — 不过时，适配 Agent 时代        │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、候选名称调研矩阵

### 2.1 可用性调研结果

调研维度：GitHub 仓库冲突、GitHub 组织名、npm 包名、知名度/联想、综合评估

| 候选名称 | GitHub 仓库 | GitHub 组织 | npm | 知名度 | 综合评级 | 结论 |
|:---------|:-----------:|:-----------:|:---|:-------|:--------:|:-----|
| **OpenPoker** | ✅ 无冲突 | ⚠️ 用户占用，但 `openpoker-org` 可用 | ✅ 可用 | 低 | ⭐⭐⭐⭐⭐ | **🥇 首选** |
| PokerSuite | ✅ 无冲突 | ✅ `poker-suite` 可用 | ✅ 可用 | 低 | ⭐⭐⭐⭐⭐ | **🥈 备选** |
| PokerKit | ❌ `uoftcprg/pokerkit` (474⭐) | - | ✅ 可用 | **高** | ⭐⭐⭐ | 强竞品，避让 |
| PokerEngine | ⚠️ 3+ 小型项目 | - | ✅ 可用 | 中 | ⭐⭐⭐ | 太泛，无特色 |
| PokerLab | ❌ `arunjo5/PokerLab` | - | ✅ 可用 | 低 | ⭐⭐⭐ | 暗示实验性，不稳定 |
| PokerCore | ❌ 2 个小型项目 | - | ✅ 可用 | 低 | ⭐⭐⭐ | 暗示仅底层，太窄 |
| PokerAI | ❌ 10+ 重名项目 | - | - | **极高** | ⭐⭐ | 烂大街，无辨识度 |
| PokerStack | ✅ 无冲突 | - | - | 低 | ⭐⭐⭐ | Stack 在扑克=筹码堆，歧义 |
| HoldemKit | ✅ 无冲突 | - | - | 低 | ⭐⭐ | 锁定 Hold'em，无法扩展 |
| **OpenHoldem** | ❌ `openholdembot` (18⭐, 153 forks) | - | - | **极高** | ⭐ | **🚫 绝对禁用** |

### 2.2 详细风险分析

#### 🚫 OpenHoldem — 绝对禁用

```
风险等级: CRITICAL

GitHub 现状:
  • openholdembot (TheHighFish/openholdembot) — 18 stars, 153 forks
  • 在扑克社区臭名昭著 = "扑克机器人/作弊工具"
  • 成立于 2009 年，历史悠久
  • Google 搜索 "OpenHoldem" 第一页全是机器人相关

后果:
  • 品牌联想 = 作弊/机器人 = 致命
  • 扑克平台可能屏蔽/审查
  • 社区信任度归零
  • 法律风险

结论: 永不考虑
```

#### ⚠️ PokerKit — 强竞品避让

```
风险等级: HIGH

GitHub 现状:
  • uoftcprg/pokerkit — 474 stars, 71 forks
  • Python 库，功能重叠（equity, hand eval, game sim）
  • 多伦多大学 CPRG 实验室出品
  • 活跃维护（最近更新 2026-07）
  • 20 个 topic 标签，SEO 权重高

后果:
  • 直接竞品名称冲突
  • SEO 竞争困难
  • 用户混淆
  • 法律风险（商标）

结论: 强烈不建议
```

#### ⚠️ PokerAI — 烂大街

```
风险等级: HIGH

GitHub 现状:
  • 10+ 个重名项目
  • PokerGPT, deep-holdem-ai, masterai-holdem...
  • 大多数是低质量/课程项目
  • 名称已被"污染"

后果:
  • 零辨识度
  • 搜索时被淹没
  • 品牌联想廉价

结论: 不建议
```

#### ✅ OpenPoker — 完全干净

```
风险等级: LOW

GitHub 现状:
  • 搜索 "OpenPoker" = 0 个相关仓库
  • 用户 @openpoker 存在但无活跃开源项目
  • 组织 @openpoker-org 可用（Not Found）

npm 现状:
  • openpoker — Not Found ✅
  • @openpoker/* — 命名空间可用 ✅

域名现状:
  • openpoker.dev — 需注册
  • openpoker.org — 需注册
  • openpoker.io — 需注册

优势:
  • "Open" = 开源、开放、开放标准
  • "Poker" = 领域明确
  • 两音节，发音清晰
  • 无技术栈暗示（不限 Rust/JS/Python）
  • 自然扩展：OpenPoker Engine / OpenPoker AI / OpenPoker Cloud
```

---

## 三、最终推荐: OpenPoker

### 3.1 为什么选择 OpenPoker

| 维度 | 表现 | 说明 |
|:-----|:-----|:-----|
| **可扩展性** | ⭐⭐⭐⭐⭐ | 从 Calculator → Engine → Platform → Ecosystem 自然过渡 |
| **游戏覆盖** | ⭐⭐⭐⭐⭐ | Texas Hold'em → Omaha → Stud → Short Deck → 未来新游戏 |
| **技术栈中立** | ⭐⭐⭐⭐⭐ | 不暗示 Rust/JS/Python，支持多语言生态 |
| **命名空间** | ⭐⭐⭐⭐⭐ | `@openpoker/core`, `@openpoker/solver` 完美支持 |
| **易记性** | ⭐⭐⭐⭐⭐ | 两个音节，发音 /ˈoʊ.pənˌpoʊ.kər/ |
| **品牌感** | ⭐⭐⭐⭐⭐ | 听起来像平台/框架，而非工具 |
| **未来感** | ⭐⭐⭐⭐⭐ | 适配 AI Agent 时代，不限于传统软件 |
| **社区友好** | ⭐⭐⭐⭐⭐ | "Open" 传达开源精神，降低贡献门槛 |
| **SEO** | ⭐⭐⭐⭐ | 独特名称，搜索时无干扰 |
| **商标** | ⭐⭐⭐⭐ | "OpenPoker" 可注册，"Open" 是描述性但组合独特 |

### 3.2 品牌名解读

```
        OpenPoker
        │    │
        │    └── 领域锚定 = 扑克
        │         不指定游戏类型 = 可扩展
        │         不指定功能 = 可扩展
        │
        └─── 精神内核 = 开源、开放、开放标准
              降低心理门槛 = "任何人都可以参与"
              传达价值观 = 透明、协作、共享
              对抗封闭 = 与商业软件形成对比
```

**一句话定位:**
> *OpenPoker — The Open Poker Intelligence Platform. Open source, open standards, open to any game.*

### 3.3 与 PokerSuite 对比

| 对比维度 | OpenPoker | PokerSuite |
|:---------|:----------|:-----------|
| 品牌力量 | **更强** — "Open" 有精神号召力 | 较好 — "Suite" 暗示套件 |
| 开源暗示 | **直接** — 名字里就有 Open | 间接 — 需要 README 说明 |
| 扩展性 | **更好** — 不限形式 | 较好 — Suite 暗示软件集合 |
| npm 命名空间 | `@openpoker/*` | `@pokersuite/*`（较长） |
| CLI 命令 | `openpoker` | `pokersuite`（较长） |
| GitHub 组织 | `openpoker-org` | `poker-suite` |
| 独特性 | **更高** — 几乎无冲突 | 较高 |
| 发音 | 3 音节 | 3 音节 |

**结论: OpenPoker 略胜一筹**，尤其在开源精神传达和命名空间简洁性上。

---

## 四、品牌架构设计

### 4.1 品牌金字塔

```
                    ┌─────────────┐
                    │   VISION    │
                    │ OpenPoker:  │
                    │  The Open   │
                    │  Standard   │
                    │  for Poker  │
                    │ Intelligence│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  CORE   │  │  CLOUD  │  │   AI    │
        │ Engine  │  │ Platform│  │  Agent  │
        │(开源)    │  │ (SaaS)  │  │ (服务)  │
        └────┬────┘  └────┬────┘  └────┬────┘
             │            │            │
    ┌────────┼────────┐   │            │
    ▼        ▼        ▼   │            │
 ┌──────┐ ┌──────┐ ┌──────┐           │
 │ Eval │ │Equity│ │Solver│           │
 │uator │ │Calc  │ │Engine│           │
 └──────┘ └──────┘ └──────┘           │
                                       │
                              ┌────────┴────────┐
                              ▼                 ▼
                         ┌─────────┐      ┌─────────┐
                         │  Coach  │      │ Review  │
                         │  Agent  │      │  Agent  │
                         └─────────┘      └─────────┘
```

### 4.2 产品矩阵

| 层级 | 产品 | 命名 | 目标用户 | 商业模式 |
|:-----|:-----|:-----|:---------|:---------|
| **Foundation** | Core Engine | `openpoker` (crate) | 开发者 | 开源免费 |
| | Equity Calculator | `@openpoker/equity` | 开发者 | 开源免费 |
| | Hand Evaluator | `@openpoker/eval` | 开发者 | 开源免费 |
| | Range Library | `@openpoker/range` | 开发者 | 开源免费 |
| **Platform** | Web App | `app.openpoker.dev` | 扑克玩家 | 免费增值 |
| | Desktop App | `OpenPoker Desktop` | 扑克玩家 | 免费增值 |
| | CLI | `openpoker-cli` | 开发者 | 开源免费 |
| | API | `api.openpoker.dev` | 开发者 | 免费额度+付费 |
| **Intelligence** | MCP Server | `@openpoker/mcp` | AI 用户 | 开源免费 |
| | AI Coach | `OpenPoker Coach` | 扑克玩家 | 订阅制 |
| | Hand Reviewer | `OpenPoker Review` | 扑克玩家 | 订阅制 |
| **Cloud** | Solver Cloud | `OpenPoker Cloud` | 专业玩家 | 按量付费 |
| | Team Workspace | `OpenPoker Teams` | 扑克团队 | 订阅制 |

---

## 五、命名空间与包管理

### 5.1 Rust Crates 命名

```
crates.io 命名:
┌─────────────────────────────────────────────────────────────┐
│  openpoker          — Core types + evaluator (根 crate)     │
│  openpoker-equity   — Monte Carlo + Exact equity            │
│  openpoker-range    — Range representation + algebra        │
│  openpoker-solver   — CFR/DCFR solver engine                │
│  openpoker-parser   — Hand history parser                   │
│  openpoker-icm      — Tournament ICM calculator             │
│  openpoker-trainer  — Training/drill engine                 │
└─────────────────────────────────────────────────────────────┘

Cargo.toml 使用:
[dependencies]
openpoker = "1.0"
openpoker-equity = "1.0"
openpoker-solver = "1.0"
```

### 5.2 npm 命名空间

```
npm 命名:
┌─────────────────────────────────────────────────────────────┐
│  @openpoker/core        — WASM bindings + types             │
│  @openpoker/sdk         — TypeScript SDK                    │
│  @openpoker/equity      — Equity calculation API            │
│  @openpoker/range       — Range operations                  │
│  @openpoker/solver      — Solver client                     │
│  @openpoker/mcp-server  — MCP Server implementation         │
│  @openpoker/ui          — React/Vue components              │
│  @openpoker/cli         — CLI wrapper                       │
└─────────────────────────────────────────────────────────────┘

安装:
npm install @openpoker/sdk
npm install -g @openpoker/mcp-server
```

### 5.3 Python 包命名

```
PyPI 命名:
┌─────────────────────────────────────────────────────────────┐
│  openpoker              — Python bindings                   │
│  openpoker-equity       — Equity module                     │
│  openpoker-solver       — Solver client                     │
└─────────────────────────────────────────────────────────────┘

pip install openpoker
```

### 5.4 GitHub 仓库结构

```
GitHub 组织: github.com/openpoker-org
（或争取 github.com/openpoker）

仓库结构:
openpoker-org/
├── openpoker              # 主仓库 — Monorepo
│   ├── crates/
│   │   ├── openpoker/
│   │   ├── openpoker-equity/
│   │   ├── openpoker-range/
│   │   ├── openpoker-solver/
│   │   └── ...
│   ├── packages/
│   │   ├── @openpoker/core/
│   │   ├── @openpoker/sdk/
│   │   └── ...
│   └── apps/
│       ├── web/
│       ├── desktop/
│       └── cli/
│
├── .github                # 社区健康文件
│   ├── profile/
│   └── ...
│
├── openpoker-docs         # 文档站点
├── openpoker-website      # 官网
└── openpoker-brand        # 品牌资产
```

### 5.5 CLI 命令设计

```bash
# 全局安装
npm install -g @openpoker/cli

# 命令设计
openpoker equity --hero AsKh --villain JJ+ --board Ts9d2h
openpoker range parse "AA,AKs,AQo+"
openpoker range analyze "JJ+,AKs" --board Ts9d2h
openpoker solve --position BTN --board Ts9d2h --pot 15
openpoker parse hands.txt --site ggpoker
openpoker trainer --category preflop --difficulty intermediate
openpoker benchmark
openpoker doctor              # 诊断环境
openpoker upgrade             # 自更新
openpoker config              # 配置管理

# 子命令帮助
openpoker --help
openpoker equity --help
openpoker solver --help
```

---

## 六、域名与社交媒体占位

### 6.1 域名策略

| 域名 | 优先级 | 用途 | 状态 | 预估价格 |
|:-----|:------:|:-----|:-----|:--------:|
| **openpoker.dev** | P0 | 主站 + 文档 | 需注册 | $12/年 |
| **openpoker.org** | P0 | 社区/基金会 | 需注册 | $12/年 |
| openpoker.io | P1 | API/云服务 | 需注册 | $30/年 |
| openpoker.app | P1 | Web App | 需注册 | $20/年 |
| openpoker.cloud | P2 | 企业云 | 待扩展 | — |
| openpoker.ai | P2 | AI 服务 | 待扩展 | — |
| getopenpoker.com | P2 | 落地页 | 需注册 | $12/年 |

### 6.2 社交媒体占位清单

| 平台 | 用户名 | 状态 | 占位优先级 |
|:-----|:-------|:-----|:----------:|
| **GitHub** | @openpoker-org | ✅ 可用 | P0 |
| **GitHub** | @openpoker | ⚠️ 用户占用（可尝试联系） | P1 |
| **Twitter/X** | @openpoker | 需检查 | P0 |
| **Twitter/X** | @openpokerdev | 备选 | P1 |
| **Discord** | discord.gg/openpoker | 需创建 | P0 |
| **YouTube** | @OpenPoker | 需注册 | P1 |
| **Reddit** | r/openpoker | 需创建 | P1 |
| **Bluesky** | @openpoker.dev | 需注册 | P2 |
| **Mastodon** | @openpoker | 需注册 | P2 |
| **LinkedIn** | OpenPoker | 需注册 | P2 |
| **Product Hunt** | @openpoker | 需注册 | P1 |
| **npm** | @openpoker | ✅ 可用 | P0 |
| **crates.io** | openpoker | 需注册 | P0 |
| **PyPI** | openpoker | 需注册 | P0 |
| **Docker Hub** | openpoker | 需注册 | P1 |

### 6.3 占位执行清单

```
T+0 天（立即执行）:
  □ 注册 GitHub 组织: github.com/openpoker-org
  □ 注册 npm 组织: @openpoker
  □ 注册 crates.io: openpoker
  □ 注册域名: openpoker.dev, openpoker.org
  □ 注册 Twitter: @openpoker 或 @openpokerdev
  □ 注册 Discord 服务器

T+7 天:
  □ 注册 PyPI: openpoker
  □ 注册 YouTube 频道
  □ 注册 Reddit r/openpoker
  □ 注册 Product Hunt

T+30 天:
  □ 注册 Bluesky / Mastodon
  □ 注册 LinkedIn 页面
  □ 注册 Docker Hub
  □ 设置统一品牌资产（头像、Banner）
```

---

## 七、品牌视觉系统

### 7.1 名称变体规范

| 场景 | 写法 | 示例 |
|:-----|:-----|:-----|
| **品牌全称** | OpenPoker | "OpenPoker — The Open Poker Intelligence Platform" |
| **仓库名** | openpoker | `github.com/openpoker-org/openpoker` |
| **CLI 命令** | openpoker | `openpoker equity --hero AsKh` |
| **包名 (Rust)** | openpoker | `openpoker = "1.0"` |
| **包名 (npm)** | @openpoker/* | `@openpoker/sdk`, `@openpoker/mcp-server` |
| **包名 (PyPI)** | openpoker | `pip install openpoker` |
| **域名** | openpoker.dev | `https://openpoker.dev` |
| **环境变量前缀** | OPENPOKER_ | `OPENPOKER_API_KEY` |
| **CSS 前缀** | op- | `.op-button`, `.op-card` |
| **常量/宏前缀** | OP_ | `OP_MAX_PLAYERS`, `OP_VERSION` |
| **Logo 文字** | OP | 简写用于小尺寸 |

### 7.2 禁止的写法

| ❌ 错误 | ✅ 正确 | 原因 |
|:--------|:--------|:-----|
| open-poker | OpenPoker | 品牌名无连字符 |
| Open Poker | OpenPoker | 无空格 |
| OPENPOKER | OpenPoker | 非全大写（除环境变量） |
| openPoker | OpenPoker | 首字母大写 |
| OPoker | OpenPoker | 不缩写 |
| Texas Holdem Calculator | — | 旧名永不使用 |

### 7.3 Logo 概念

```
OpenPoker Logo Concept:

主元素:
  • 字母 "O" + 扑克牌元素融合
  • 或抽象的黑桃/梅花符号 + 开放感

配色:
  Primary:   #0A84FF (科技蓝) — 代表开放/技术
  Secondary: #FFD60A (扑克金) — 代表扑克/胜利
  Accent:    #30D158 (成功绿) — 代表正确/增长
  Dark:      #0D1117 (GitHub 黑) — 开发者友好

风格:
  • 现代、简洁、几何化
  • 暗色主题优先
  • 小尺寸可识别 (16x16 favicon)
  • 支持单色/反色

变体:
  • 完整版: OpenPoker + 图标 + 标语
  • 图标版: 仅图标
  • 文字版: 仅 OpenPoker
  • 社媒版: 圆形裁剪
```

---

## 八、迁移路线图

### 8.1 从 texas-holdem-calculator 到 OpenPoker

```
Phase 1: 准备 (Week 1-2)
├── 注册所有品牌资产（域名、社媒、包管理器）
├── 创建新 GitHub 组织 openpoker-org
├── 设计新 Logo 和视觉系统
├── 准备新 README 和文档
└── 设置仓库重定向（保留旧仓库）

Phase 2: 迁移 (Week 3-4)
├── 将代码迁移到新仓库（保留 git history）
├── 重命名所有内部引用
├── 更新 Cargo.toml / package.json 中的包名
├── 发布新 crate: openpoker (v0.1.0)
├── 发布新 npm: @openpoker/core (v0.1.0)
└── 更新 CI/CD 配置

Phase 3: 公告 (Week 5)
├── 发布迁移公告博客
├── 在旧仓库置顶迁移通知
├── 在旧仓库设置 archive 通知
├── 在所有渠道发布公告
└── 更新所有外部链接

Phase 4: 封存 (Week 6-8)
├── 旧仓库设置为 Archive（保留只读）
├── 旧仓库 README 添加重定向
├── 旧 npm 包废弃（deprecate）
├── 旧 crate 废弃（yank）
└── 监控迁移后的流量/Stars
```

### 8.2 旧仓库处理

```markdown
<!-- 旧仓库 texas-holdem-calculator 的 README -->

# ⚠️ 项目已迁移

**本项目已更名为 OpenPoker 并迁移至新仓库。**

OpenPoker 是一个更全面、更强大的开源扑克智能平台，
包含权益计算、范围分析、GTO 求解器、AI 教练等功能。

## 🚀 请访问新项目

- 🌐 官网: https://openpoker.dev
- 💻 仓库: https://github.com/openpoker-org/openpoker
- 📖 文档: https://docs.openpoker.dev
- 💬 Discord: https://discord.gg/openpoker

## 为什么改名？

texas-holdem-calculator 这个名字限制了我们向更广阔的
扑克智能平台发展。OpenPoker 更能代表我们的愿景：
开放、可扩展、AI 驱动的扑克技术生态。

感谢所有早期支持者和贡献者！我们在 OpenPoker 等你。
```

### 8.3 Stars 迁移策略

| 策略 | 实施方式 | 预期保留率 |
|:-----|:---------|:----------:|
| **GitHub 重定向** | 旧仓库设置新 URL 重定向 | 100% 访问 |
| **Archive 保留** | 旧仓库设为 Archive，不清除 | Stars 保留 |
| **公告引导** | 引导现有 Stars 用户 Star 新仓库 | 20-30% |
| **内容营销** | 用新内容吸引新 Stars | 主要增长来源 |

**关键洞察**: 不要试图"转移"Stars。旧仓库的 Stars 是历史资产，新项目的 Stars 需要重新积累。但旧仓库的访问会通过重定向流向新项目。

---

## 九、竞品命名分析

### 9.1 成功品牌命名案例

| 品牌 | 原名/定位 | 命名策略 | 成功因素 |
|:-----|:----------|:---------|:---------|
| **React** | — | 化学反应隐喻 | 简洁、抽象、可扩展 |
| **Vue** | — | 视图(View)的法语 | 简洁、国际化 |
| **Next.js** | — | 下一步 | 暗示进化、未来 |
| **TensorFlow** | — | 张量+流动 | 技术准确+形象 |
| **LangChain** | — | 语言+链 | 直白描述+可扩展 |
| **PokerStove** | — | 扑克+火炉 | 早期，但"Stove"过时 |
| **PioSOLVER** | — | 人名+Solver | 专业但封闭 |
| **GTO+** | — | GTO+ | 功能描述，无品牌 |

### 9.2 扑克软件命名趋势

```
早期 (2000-2010):
  • PokerStove — 工具感强
  • Equilab — 功能描述
  • Flopzilla — 趣味但低龄

中期 (2010-2020):
  • PioSOLVER — 专业封闭
  • GTO+ — 功能导向
  • MonkerSolver — 个人品牌

现代 (2020+):
  • 趋势: 抽象、平台化、AI 关联
  • 成功案例: None（这正是机会）

OpenPoker 定位:
  • 填补 "开源扑克平台" 的品牌空白
  • 类似 React 在 UI 框架中的地位
  • 成为 "扑克技术 = OpenPoker" 的心智占领
```

---

## 附录 A: 命名工作坊产出

### A.1 头脑风暴过程

```
第一轮: 开放相关
  OpenPoker ✓  |  OpenHoldem ✗  |  OpenCard  ✗
  FreePoker ✗  |  LibrePoker ✗  |  PokerOpen ✗

第二轮: 平台相关
  PokerKit  ✗  |  PokerStack ✗  |  PokerBase ✗
  PokerHub  ✗  |  PokerCore  ✗  |  PokerNode ✗

第三轮: 智能相关
  PokerAI   ✗  |  SmartPoker ✗  |  PokerMind ✗
  PokerBrain ✗ |  PokerSense ✗  |  PokerWise ✗

第四轮: 组合创新
  OpenPoker ✓  |  PokerSuite ✓  |  PokerVerse ✗
  CardKit   ✗  |  HandStack  ✗  |  RiverTech ✗

最终筛选:
  1. OpenPoker — 开源精神 + 领域明确 + 可扩展
  2. PokerSuite — 套件感强 + 清晰
  3. 放弃其余 — 冲突/限制/无特色
```

### A.2 用户心智测试

| 问题 | OpenPoker 联想 | PokerSuite 联想 |
|:-----|:---------------|:----------------|
| "这是什么？" | 开源扑克平台 | 扑克软件套件 |
| "是免费的吗？" | 是（Open暗示） | 不确定 |
| "能做什么？" | 任何扑克相关 | 一套工具 |
| "是哪家公司的？" | 社区/开源 | 公司/产品 |
| "值得信任吗？" | 透明/开放 | 专业/商业 |
| "能参与贡献吗？" | 是（Open暗示） | 不确定 |

**结论: OpenPoker 在开源友好度和心智占领上明显胜出。**

---

## 附录 B: 法律注意事项

### B.1 商标检索建议

```
建议委托律师或专业服务进行:
1. USPTO (美国) 商标检索
2. EUIPO (欧盟) 商标检索
3. WIPO 国际商标检索
4. 中国商标局检索

检索关键词:
  - OpenPoker
  - OPENPOKER
  - 相关图形商标

风险点:
  - "Open" 是描述性词汇，单独注册困难
  - "OpenPoker" 作为组合词，注册成功率较高
  - 需确认不与现有 "Open*" 扑克商标冲突
```

### B.2 开源许可证

```
推荐: MIT License
理由:
  • 最宽松，最大化采用率
  • 企业友好，无商业限制
  • 与 Open 品牌精神一致
  • 简单易懂，降低法律门槛

备选: Apache-2.0
  • 如需专利保护条款
  • 更正式的企业友好许可证
```

---

> **文档结束**。OpenPoker 不仅是一个名字，是一个宣言：
> 
> *"扑克技术应该是开放的、可扩展的、AI 原生的。
>  任何人都可以参与，任何游戏都可以支持，任何平台都可以运行。"*
> 
> 从 texas-holdem-calculator 到 OpenPoker，是从工具到平台的蜕变。