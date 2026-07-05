# OpenPoker Design Documents

> 🏗️ 本项目的设计蓝图集。所有文档均为项目启动前的架构与策略设计。

## 📚 文档索引

| # | 文档 | 内容 | 大小 |
|:--|:-----|:-----|:----:|
| 01 | [项目审计报告](01-audit-report.md) | 原项目16维度审计，30个关键问题 | 22KB |
| 02 | [系统架构设计](02-architecture-design.md) | 5层架构，14子系统，Monorepo目录结构 | 86KB |
| 03 | [算法体系设计](03-algorithm-design.md) | 12算法，复杂度，SIMD/GPU/WASM优化 | 74KB |
| 04 | [Agent-Native架构](04-agent-native-design.md) | OpenAPI/MCP/RAG/多Agent/多模态/实时 | 90KB |
| 05 | [GitHub仓库设计](05-github-repo-design.md) | README/Banner/Demo/Benchmark/CI/CD | 47KB |
| 06 | [增长作战手册](06-growth-strategy.md) | 10K Stars目标，13渠道全策略 | 53KB |
| 07 | [品牌升级策略](07-branding-strategy.md) | 命名调研，OpenPoker品牌架构 | 17KB |
| 08 | [36个月路线图](08-36-month-roadmap.md) | Phase1→Phase4，最终成为OPIP | 33KB |

**总设计字数**: 约 42 万字

---

## 🎯 项目愿景

> **OpenPoker** — The Open Poker Intelligence Platform
>
> 从 texas-holdem-calculator 的灰烬中，构建一个 Agent-Native、AI-First、开源开放的扑克智能平台。

### 核心原则

1. **Open** — 开源、开放标准、开放生态
2. **Fast** — Rust + SIMD + WASM，极致性能
3. **AI-Native** — MCP Server，AI Agent 直接调用
4. **Extensible** — 不限游戏、不限平台、不限语言

---

*设计日期: 2026-06-17*
*版本: v0.0.0-design*
