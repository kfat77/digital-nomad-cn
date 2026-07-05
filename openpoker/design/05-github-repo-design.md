# GitHub 仓库全面设计文档
# Open Poker Intelligence Platform

> **目标**: 登上 GitHub Trending，成为全球最受关注的扑克开源项目
> **设计日期**: 2026-06-17
> **版本**: v1.0

---

## 目录

1. [README 设计](#1-readme-设计)
2. [Banner & Logo](#2-banner--logo)
3. [Demo & GIF](#3-demo--gif)
4. [Benchmarks](#4-benchmarks)
5. [Examples](#5-examples)
6. [Issue 模板](#6-issue-模板)
7. [PR 模板](#7-pr-模板)
8. [Wiki 设计](#8-wiki-设计)
9. [Projects 看板](#9-projects-看板)
10. [Releases 规范](#10-releases-规范)
11. [CI/CD 工作流](#11-cicd-工作流)
12. [Benchmark 自动化](#12-benchmark-自动化)
13. [Documentation 站点](#13-documentation-站点)
14. [Good First Issue](#14-good-first-issue)
15. [Hacktoberfest](#15-hacktoberfest)
16. [GitHub Actions](#16-github-actions)
17. [Sponsor 赞助](#17-sponsor-赞助)
18. [GitHub Trending 增长策略](#18-github-trending-增长策略)

---

## 1. README 设计

### 1.1 Above-the-Fold 区域（首屏）

首屏是用户决定是否继续阅读的关键。必须在 3 秒内传达核心价值。

```markdown
<!-- 顶部 Banner -->
<p align="center">
  <img src="https://raw.githubusercontent.com/poker-suite/poker-suite/main/assets/banner.svg" 
       width="100%" 
       alt="Poker Suite - Open Poker Intelligence Platform">
</p>

<!-- 徽章行 — 密集排列，展示项目活跃度 -->
<p align="center">
  <a href="https://github.com/poker-suite/poker-suite/stargazers">
    <img src="https://img.shields.io/github/stars/poker-suite/poker-suite?style=for-the-badge&logo=github&color=ffd700&labelColor=1a1a2e" alt="Stars">
  </a>
  <a href="https://github.com/poker-suite/poker-suite/network/members">
    <img src="https://img.shields.io/github/forks/poker-suite/poker-suite?style=for-the-badge&logo=github&color=00d4aa&labelColor=1a1a2e" alt="Forks">
  </a>
  <a href="https://github.com/poker-suite/poker-suite/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/poker-suite/poker-suite/ci.yml?branch=main&style=for-the-badge&logo=github-actions&color=2088ff&labelColor=1a1a2e" alt="CI">
  </a>
  <a href="https://codecov.io/gh/poker-suite/poker-suite">
    <img src="https://img.shields.io/codecov/c/github/poker-suite/poker-suite?style=for-the-badge&logo=codecov&color=f01f7a&labelColor=1a1a2e" alt="Coverage">
  </a>
  <a href="https://crates.io/crates/poker-suite">
    <img src="https://img.shields.io/crates/v/poker-suite?style=for-the-badge&logo=rust&color=dea584&labelColor=1a1a2e" alt="Crates.io">
  </a>
  <a href="https://www.npmjs.com/package/@poker-suite/sdk">
    <img src="https://img.shields.io/npm/v/@poker-suite/sdk?style=for-the-badge&logo=npm&color=cb3837&labelColor=1a1a2e" alt="npm">
  </a>
  <a href="https://poker-suite.dev">
    <img src="https://img.shields.io/badge/🔗-Live_Demo-00d4aa?style=for-the-badge&labelColor=1a1a2e" alt="Demo">
  </a>
</p>

<!-- 一句话价值主张 -->
<h1 align="center">
  <sub>⚡</sub> Poker Suite <sub>♠</sub>
</h1>

<p align="center">
  <b>Open Poker Intelligence Platform</b><br>
  <sub>The fastest, most open, and AI-powered poker analysis toolkit — from equity calculation to GTO solving</sub>
</p>

<!-- 技术亮点徽章 -->
<p align="center">
  <img src="https://img.shields.io/badge/Rust-🦀-dea584?style=flat-square&logo=rust&logoColor=white" alt="Rust">
  <img src="https://img.shields.io/badge/WASM-🕸️-654ff0?style=flat-square" alt="WASM">
  <img src="https://img.shields.io/badge/SIMD-AVX2-00d4aa?style=flat-square" alt="SIMD">
  <img src="https://img.shields.io/badge/PWA-📱-5a0fc8?style=flat-square" alt="PWA">
  <img src="https://img.shields.io/badge/MCP-🤖-ff6b6b?style=flat-square" alt="MCP">
  <img src="https://img.shields.io/badge/Open_Source-MIT-ffd700?style=flat-square" alt="MIT">
</p>

<!-- 快速开始 — 复制粘贴即可运行 -->
<h2 align="center">🚀 Try it in 5 seconds</h2>

```bash
# CLI — Calculate equity instantly
$ cargo install poker-suite-cli
$ poker-suite equity --hero "AsKh" --villain "JJ+" --board "Ts9d2h"
# → Equity: 47.3% | Win: 45.2% | Tie: 4.2% | 100K sims in 8ms
```

```typescript
// SDK — Use in your project
import { PokerSDK } from "@poker-suite/sdk";
const sdk = new PokerSDK();
const result = await sdk.calculateEquity({ hero: "AsKh", villain: "JJ+", board: "Ts9d2h" });
// → { equity: 0.473, win: 0.452, tie: 0.042 }
```

<p align="center">
  <a href="https://poker-suite.dev"><b>🌐 Live Demo</b></a> •
  <a href="https://docs.poker-suite.dev"><b>📖 Documentation</b></a> •
  <a href="https://discord.gg/pokersuite"><b>💬 Discord</b></a> •
  <a href="https://twitter.com/pokersuite"><b>🐦 Twitter</b></a>
</p>

---
```

### 1.2 性能展示区域（Benchmarks）

```markdown
## ⚡ Performance

Blazing fast equity calculation powered by Rust + SIMD. 100K Monte Carlo simulations in **8ms**.

| Operation | Poker Suite | PokerStove | Equilab | OMPEval |
|:----------|:-----------:|:----------:|:-------:|:-------:|
| 5-card eval | **3ns** | 50ns | — | 5ns |
| 7-card eval | **150ns** | 2μs | — | 200ns |
| 100K MC (2-way, Flop) | **8ms** | 120ms | 200ms | 50ms |
| 1M MC (Pre) | **80ms** | 1.2s | 2s | 500ms |
| Range vs Range | **50ms** | — | 1s | 200ms |
| WASM 7-card | **300ns** | — | — | 2μs |

*Benchmarked on AMD Ryzen 9 5950X, 16 threads. [See full benchmarks →](BENCHMARKS.md)*

<!-- 自动生成的性能图表 -->
<p align="center">
  <img src="https://raw.githubusercontent.com/poker-suite/poker-suite/main/assets/benchmark-chart.svg" width="80%" alt="Performance comparison chart">
</p>
```

### 1.3 功能矩阵

```markdown
## ✨ Features

### 🔢 Equity Calculator
- ⚡ **Monte Carlo** — 100K+ simulations with SIMD batch evaluation
- 🎯 **Exact Enumeration** — 100% accurate for small cases (Flop/Turn)
- 🎭 **Multiway** — 2-6 player equity calculation
- 📊 **Range vs Range** — 1326-bit mask algebra with visual matrix

### 🤖 AI Coach
- 🧠 **LLM Agent** — ReAct loop with tool calling (MCP)
- 📚 **RAG Knowledge Base** — GTO strategies, hand analysis
- 💬 **Natural Language** — "What should I do with AKs on BTN vs 3bet?"
- 🔄 **Memory** — Learns your style and weaknesses

### 🧩 GTO Solver
- 🌳 **DCFR** — Discounted CFR for fast convergence
- 📈 **Exploitability** — Measure distance from Nash equilibrium
- 🎨 **Tree Visualization** — Interactive game tree explorer
- 💾 **Strategy Export** — JSON / GTO+ compatible format

### 📱 Multi-Platform
| Platform | Status | Installation |
|:---------|:------:|:-------------|
| Web (PWA) | ✅ | [poker-suite.dev](https://poker-suite.dev) |
| Desktop (Win/Mac/Linux) | ✅ | `cargo install poker-suite-desktop` |
| CLI | ✅ | `cargo install poker-suite-cli` |
| npm SDK | ✅ | `npm i @poker-suite/sdk` |
| Python SDK | 🚧 | `pip install poker-suite` |
| MCP Server | ✅ | `npx @poker-suite/mcp-server` |
```

### 1.4 架构概览

```markdown
## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Applications    Web │ Desktop │ CLI │ MCP │ Agent         │
├─────────────────────────────────────────────────────────────┤
│  SDK              JS/TS │ Python │ Rust                      │
├─────────────────────────────────────────────────────────────┤
│  Domain      Calculator │ Solver │ Range │ Trainer │ Parser  │
├─────────────────────────────────────────────────────────────┤
│  Core        Evaluator │ Equity-MC │ CFR │ Range-Ops        │
├─────────────────────────────────────────────────────────────┤
│  Infra       SQLite │ DuckDB │ OPFS │ WASM │ SIMD           │
└─────────────────────────────────────────────────────────────┘
```

- **Rust Core** — Zero-cost abstractions, memory-safe, WASM-friendly
- **SIMD Acceleration** — AVX2 batch evaluation, 8-16x faster
- **Web Worker** — Non-blocking UI, progress callbacks
- **PWA Offline** — Full functionality without internet
```

### 1.5 快速开始

```markdown
## 🚀 Quick Start

### Web (No Installation)
👉 [poker-suite.dev](https://poker-suite.dev) — Open in browser, works offline

### CLI
```bash
# Install
cargo install poker-suite-cli

# Calculate equity
poker-suite equity --hero "AsKh" --villain "JJ+" --board "Ts9d2h"

# Parse hand history
poker-suite parse hands.txt --site ggpoker

# Range operations
poker-suite range union "AA,AKs" "KK,QQ"
```

### SDK
```typescript
import { PokerSDK } from "@poker-suite/sdk";

const sdk = new PokerSDK();

// Calculate equity
const result = await sdk.calculateEquity({
  hero: "AsKh",
  villain: "JJ+",
  board: "Ts9d2h",
  iterations: 100_000
});
console.log(`Equity: ${(result.equity * 100).toFixed(1)}%`);
// → Equity: 47.3%
```

### MCP Server (AI Integration)
```bash
# Add to your MCP config
{
  "mcpServers": {
    "poker": {
      "command": "npx",
      "args": ["-y", "@poker-suite/mcp-server"]
    }
  }
}
```

Then ask your AI: *"What's the equity of AKs vs JJ+ on Ts9d2h?"*
```

### 1.6 社区与贡献

```markdown
## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Good First Issues
🔰 [Issues labeled `good first issue`](https://github.com/poker-suite/poker-suite/labels/good%20first%20issue)

### Contributors
<a href="https://github.com/poker-suite/poker-suite/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=poker-suite/poker-suite" alt="Contributors">
</a>

## 💖 Sponsors

Poker Suite is built by the community. [Become a sponsor](https://github.com/sponsors/poker-suite) to support development.

<p align="center">
  <a href="https://github.com/sponsors/poker-suite">
    <img src="https://img.shields.io/badge/💖-Sponsor_this_project-ff6b6b?style=for-the-badge&logo=github-sponsors" alt="Sponsor">
  </a>
</p>

## 📜 License

MIT © [Poker Suite Contributors](https://github.com/poker-suite/poker-suite/graphs/contributors)
```

### 1.7 README 英文版

英文版结构相同，但语言调整为地道英文表达，去除中文语境特有的表达方式。

---

## 2. Banner & Logo

### 2.1 SVG Banner 设计

```svg
<!-- assets/banner.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300">
  <defs>
    <!-- 渐变背景 -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117"/>
      <stop offset="100%" style="stop-color:#161b22"/>
    </linearGradient>
    <!-- 金色渐变 -->
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffd700"/>
      <stop offset="100%" style="stop-color:#ffaa00"/>
    </linearGradient>
    <!-- 发光效果 -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="1200" height="300" fill="url(#bg)"/>
  
  <!-- 装饰性网格 -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#21262d" stroke-width="0.5"/>
  </pattern>
  <rect width="1200" height="300" fill="url(#grid)"/>
  
  <!-- 扑克牌元素 -->
  <g transform="translate(100, 80)">
    <!-- 黑桃 -->
    <text x="0" y="120" font-size="140" fill="#58a6ff" opacity="0.1">♠</text>
    <!-- 红桃 -->
    <text x="850" y="120" font-size="140" fill="#ff6b6b" opacity="0.1">♥</text>
    <!-- 梅花 -->
    <text x="100" y="220" font-size="100" fill="#4ade80" opacity="0.1">♣</text>
    <!-- 方块 -->
    <text x="950" y="220" font-size="100" fill="#ffd700" opacity="0.1">♦</text>
  </g>
  
  <!-- 主标题 -->
  <text x="600" y="130" text-anchor="middle" font-family="-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Helvetica,Arial" font-size="72" font-weight="800" fill="url(#gold)" filter="url(#glow)">
    Poker Suite
  </text>
  
  <!-- 副标题 -->
  <text x="600" y="175" text-anchor="middle" font-family="-apple-system,system-ui" font-size="28" fill="#8b949e">
    Open Poker Intelligence Platform
  </text>
  
  <!-- 特性标签 -->
  <g transform="translate(600, 220)" text-anchor="middle">
    <text x="-300" y="0" font-size="16" fill="#58a6ff">⚡ Blazing Fast</text>
    <text x="-100" y="0" font-size="16" fill="#4ade80">🔓 Open Source</text>
    <text x="100" y="0" font-size="16" fill="#ff6b6b">🤖 AI-Powered</text>
    <text x="300" y="0" font-size="16" fill="#ffd700">🌐 Multi-Platform</text>
  </g>
  
  <!-- 底部装饰线 -->
  <line x1="200" y1="260" x2="1000" y2="260" stroke="#30363d" stroke-width="1"/>
</svg>
```

### 2.2 Logo 设计

```svg
<!-- assets/logo.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700"/>
      <stop offset="100%" style="stop-color:#ff8c00"/>
    </linearGradient>
    <filter id="logoGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 背景圆 -->
  <circle cx="100" cy="100" r="90" fill="#0d1117" stroke="url(#logoGold)" stroke-width="3"/>
  
  <!-- 中心黑桃 -->
  <text x="100" y="135" text-anchor="middle" font-size="100" fill="url(#logoGold)" filter="url(#logoGlow)">♠</text>
  
  <!-- 装饰点 -->
  <circle cx="100" cy="35" r="4" fill="#ff6b6b"/>
  <circle cx="165" cy="100" r="4" fill="#ffd700"/>
  <circle cx="100" cy="165" r="4" fill="#4ade80"/>
  <circle cx="35" cy="100" r="4" fill="#58a6ff"/>
</svg>
```

### 2.3 Favicon

```svg
<!-- assets/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d1117"/>
  <text x="16" y="24" text-anchor="middle" font-size="22" fill="#ffd700">♠</text>
</svg>
```

---

## 3. Demo & GIF

### 3.1 在线 Demo

**部署**: Vercel + GitHub Pages 双部署
- 主站: `https://poker-suite.dev` (Vercel)
- 备用: `https://poker-suite.github.io` (GitHub Pages)

### 3.2 GIF 动画设计

需要制作以下 GIF（使用 Screen Studio 或 LICEcap）：

| GIF | 时长 | 内容 | 文件名 |
|-----|:----:|:-----|:-------|
| **hero-demo** | 8s | 选牌 → 计算 → 概率条动画 | `demo-equity.gif` |
| **range-matrix** | 6s | 点击矩阵格子 → 高亮 → 范围百分比变化 | `demo-range.gif` |
| **solver-viz** | 10s | 博弈树展开 → 策略热力图 | `demo-solver.gif` |
| **ai-coach** | 8s | 输入问题 → AI 流式回复 | `demo-ai.gif` |
| **cli-demo** | 6s | 终端输入命令 → 即时结果 | `demo-cli.gif` |
| **benchmark** | 5s | 性能图表动态更新 | `demo-benchmark.gif` |

### 3.3 GIF 制作规范

- 分辨率: 1200×675 (16:9)
- 帧率: 30fps
- 文件大小: < 5MB 每个
- 循环: 无限循环
- 背景: 与仓库主题一致（深色）
- 标注: 关键步骤添加文字提示

### 3.4 视频 Demo

YouTube 视频（可选但推荐）：
- 标题: "Poker Suite — The Open Source Poker Intelligence Platform"
- 时长: 3-5 分钟
- 内容: 功能 walkthrough + 性能展示 + 开发者介绍
- 嵌入 README: 使用 YouTube thumbnail 链接

---

## 4. Benchmarks

### 4.1 BENCHMARKS.md

```markdown
# Benchmarks

All benchmarks run on AMD Ryzen 9 5950X (16 cores, 32 threads), 64GB RAM.

## Environment

| Component | Specification |
|:----------|:-------------|
| CPU | AMD Ryzen 9 5950X @ 3.4GHz |
| RAM | DDR4-3200 64GB |
| OS | Ubuntu 22.04 LTS |
| Rust | 1.80.0 |
| Node | 20.12.0 |

## Hand Evaluation

```
5-card evaluation    3.2 ns    ✅ Perfect Hash
7-card evaluation    147 ns    ✅ C(7,5)=21 combos
7-card (SIMD batch)  52 ns     ✅ AVX2 ×8 parallel
```

## Monte Carlo Equity

| Scenario | Iterations | Single Thread | 16 Threads | WASM (Chrome) |
|:---------|:----------:|:-------------:|:----------:|:-------------:|
| Pre-flop (2-way) | 100K | 52ms | 8ms | 200ms |
| Flop (2-way) | 100K | 48ms | 7ms | 180ms |
| Turn (2-way) | 100K | 45ms | 6ms | 170ms |
| Pre-flop (3-way) | 500K | 280ms | 42ms | 1.1s |
| Range vs Range (各100) | 100K | 52ms | 8ms | 200ms |

## Exact Enumeration

| Scenario | Combinations | Time | Method |
|:---------|:------------:|:----:|:-------|
| Flop (2-way, 1 range) | 972K | 95ms | Exact |
| Turn (2-way) | 41K | 4ms | Exact |
| River | 1 | 300ns | Direct eval |

## Comparison with Other Tools

| Tool | 100K MC (Flop) | License | Open Source |
|:-----|:-------------:|:-------:|:-----------:|
| **Poker Suite** | **8ms** | MIT | ✅ |
| PokerStove | 120ms | GPL | ✅ |
| Equilab | 200ms | Proprietary | ❌ |
| OMPEval | 50ms | MIT | ✅ |
| ProPokerTools | 150ms | Proprietary | ❌ |

## Reproducing Benchmarks

```bash
$ git clone https://github.com/poker-suite/poker-suite.git
$ cd poker-suite
$ cargo bench
```

Results will be saved to `target/criterion/` and can be viewed with:
```bash
$ cargo install cargo-criterion
$ cargo criterion --open
```
```

### 4.2 自动化基准测试

见第 12 节 Benchmark 自动化。

---

## 5. Examples

### 5.1 examples/ 目录结构

```
examples/
├── README.md
├── cli/
│   ├── basic-equity.rs
│   ├── range-operations.rs
│   ├── hand-history-parse.rs
│   └── multiway-equity.rs
├── wasm/
│   ├── browser-simple.html
│   ├── browser-range.html
│   ├── node-equity.js
│   └── react-component.tsx
├── sdk/
│   ├── basic-usage.ts
│   ├── range-analysis.ts
│   ├── hand-import.ts
│   └── ai-coach.ts
├── api/
│   ├── curl-examples.sh
│   ├── python-client.py
│   └── postman-collection.json
└── mcp/
    ├── claude-desktop-config.json
    ├── cursor-config.json
    └── example-conversation.md
```

### 5.2 示例代码

```rust
// examples/cli/basic-equity.rs
use poker_suite::{Card, PokerEngine};

fn main() {
    let engine = PokerEngine::new();
    
    // Hero: AKs
    let hero = [Card::from_str("As"), Card::from_str("Kh")];
    
    // Villain: JJ+
    let villain_range = poker_suite::parse_range("JJ+").unwrap();
    
    // Board: T♠ 9♦ 2♥
    let board = [
        Card::from_str("Ts"),
        Card::from_str("9d"),
        Card::from_str("2h"),
    ];
    
    let result = engine.calculate_equity(hero, &villain_range, &board);
    
    println!("Equity: {:.1}%", result.equity * 100.0);
    println!("Win: {:.1}%", result.win * 100.0);
    println!("Tie: {:.1}%", result.tie * 100.0);
}
```

```typescript
// examples/sdk/basic-usage.ts
import { PokerSDK } from "@poker-suite/sdk";

async function main() {
  const sdk = new PokerSDK();
  
  // Calculate equity
  const result = await sdk.calculateEquity({
    hero: "AsKh",
    villain: "JJ+",
    board: "Ts9d2h",
    iterations: 100_000,
  });
  
  console.log(`Equity: ${(result.equity * 100).toFixed(1)}%`);
  
  // Range operations
  const range = sdk.parseRange("AA,AKs,AQo+,66-99,T5s-98s");
  console.log(`Range: ${range.percent().toFixed(1)}%`);
  
  // Filter by board texture
  const flushDraws = range.filter(board, filters.flushDraw);
  console.log(`Flush draws: ${flushDraws.percent().toFixed(1)}%`);
}
```

---

## 6. Issue 模板

### 6.1 .github/ISSUE_TEMPLATE/bug_report.yml

```yaml
name: 🐛 Bug Report
description: Report a bug to help us improve
title: "[Bug]: "
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report a bug! Please fill out the information below.

  - type: dropdown
    id: component
    attributes:
      label: Component
      description: Which part of Poker Suite is affected?
      options:
        - Core Engine (Rust)
        - Web App
        - Desktop App
        - CLI
        - SDK
        - MCP Server
        - Documentation
        - Other
    validations:
      required: true

  - type: input
    id: version
    attributes:
      label: Version
      description: What version of Poker Suite are you using?
      placeholder: e.g., v1.2.3
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear description of the bug
      placeholder: When I calculate equity for AKs vs QQ on Ts9d2h, the result is incorrect...
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Enter '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened?
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: |
        - OS: [e.g., macOS 14, Windows 11, Ubuntu 22.04]
        - Browser: [e.g., Chrome 120, Safari 17]
        - Rust version: [e.g., 1.80.0]
      value: |
        - OS: 
        - Browser: 
        - Rust version: 
    validations:
      required: false

  - type: textarea
    id: logs
    attributes:
      label: Logs/Screenshots
      description: If applicable, add logs or screenshots
    validations:
      required: false
```

### 6.2 .github/ISSUE_TEMPLATE/feature_request.yml

```yaml
name: ✨ Feature Request
description: Suggest a new feature
title: "[Feature]: "
labels: ["enhancement", "triage"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: What problem does this feature solve?
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives
      description: Describe alternatives you've considered
    validations:
      required: false

  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - Nice to have
        - Important
        - Critical
```

### 6.3 .github/ISSUE_TEMPLATE/good_first_issue.yml

```yaml
name: 🔰 Good First Issue
description: Create a task suitable for new contributors
title: "[GFI]: "
labels: ["good first issue", "help wanted"]
body:
  - type: textarea
    id: task
    attributes:
      label: Task Description
      description: What needs to be done?
    validations:
      required: true

  - type: textarea
    id: guidance
    attributes:
      label: Getting Started
      description: How can a new contributor get started?
      value: |
        1. Fork the repository
        2. Run `cargo test` to ensure tests pass
        3. Check out the relevant code in `crates/`
        4. Make your changes
        5. Run tests again: `cargo test`
        6. Submit a PR!
    validations:
      required: true

  - type: input
    id: difficulty
    attributes:
      label: Estimated Difficulty
      placeholder: e.g., Easy (2-3 hours)
```

---

## 7. PR 模板

### 7.1 .github/PULL_REQUEST_TEMPLATE.md

```markdown
## Description

<!-- Describe your changes in detail -->

## Related Issue

<!-- Link to the issue this PR addresses -->
Fixes #(issue)

## Type of Change

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📚 Documentation update
- [ ] ⚡ Performance improvement
- [ ] 🔧 Refactoring
- [ ] 🧪 Test update

## Checklist

- [ ] I have read the [CONTRIBUTING.md](CONTRIBUTING.md)
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have added tests that prove my fix/feature works
- [ ] All new and existing tests pass (`cargo test`)
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings

## Benchmark Results

<!-- If applicable, include benchmark results -->

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->
```

---

## 8. Wiki 设计

### 8.1 Wiki 页面结构

```
Home
├── 🚀 Getting Started
│   ├── Installation
│   ├── Quick Start Guide
│   ├── First Equity Calculation
│   └── Troubleshooting
│
├── 📖 User Guide
│   ├── Equity Calculator
│   ├── Range Matrix
│   ├── Hand History Import
│   ├── Analytics Dashboard
│   └── AI Coach
│
├── 🧩 Developer Guide
│   ├── Architecture Overview
│   ├── Contributing Guide
│   ├── Code Style
│   ├── Testing
│   └── Benchmarking
│
├── 🔧 API Reference
│   ├── REST API
│   ├── gRPC API
│   ├── SDK (JavaScript)
│   ├── SDK (Python)
│   └── MCP Tools
│
├── 🎓 Tutorials
│   ├── Building a Custom HUD
│   ├── Analyzing Your First Session
│   ├── Creating a Plugin
│   └── Integrating with Your Poker Room
│
├── 🧪 Advanced Topics
│   ├── Algorithm Deep Dive
│   ├── SIMD Optimization
│   ├── WASM Internals
│   └── Solver Configuration
│
└── 📋 FAQ
    ├── General Questions
    ├── Technical Questions
    └── Contributing Questions
```

---

## 9. Projects 看板

### 9.1 GitHub Projects 配置

**Board 名称**: "Poker Suite Roadmap"

**Columns**:
1. 📋 Backlog
2. 🎯 To Do
3. 🏃 In Progress
4. 👀 In Review
5. ✅ Done

**视图**:
- **Board**: Kanban 风格看板
- **Roadmap**: 时间线视图（按 Milestone）
- **Table**: 详细列表视图

**自动工作流**:
- PR 关联 Issue → Issue 自动移动到 "In Review"
- PR 合并 → Issue 自动移动到 "Done"
- Issue 被分配 → 自动移动到 "To Do"

### 9.2 Milestones

| Milestone | Due Date | Description |
|:----------|:--------:|:------------|
| v0.1.0 Foundation | 2026-09 | Core engine + Web app |
| v0.2.0 Range | 2026-11 | Range system + Matrix UI |
| v0.3.0 Parser | 2027-01 | HH parser + Database |
| v0.4.0 Trainer | 2027-03 | Training system |
| v0.5.0 Solver | 2027-06 | DCFR solver |
| v1.0.0 Platform | 2027-09 | SDK + API + Desktop |
| v1.1.0 AI | 2027-12 | AI Coach + MCP |
| v1.2.0 Cloud | 2028-03 | Cloud platform |
| v2.0.0 Ecosystem | 2028-06 | Full ecosystem |

---

## 10. Releases 规范

### 10.1 发布流程

```
1. 创建 Release PR
   - 更新 CHANGELOG.md
   - 更新 version in Cargo.toml / package.json
   - 更新 README 中的版本徽章

2. CI 验证
   - 所有测试通过
   - Benchmark 无回归
   - 构建成功

3. 创建 GitHub Release
   - 使用自动生成的 release notes
   - 附加构建产物
   - 标记 Milestone

4. 发布到包管理器
   - crates.io (cargo publish)
   - npm (npm publish)
   - PyPI (twine upload)
   - GitHub Container Registry (docker push)

5. 通知
   - Discord 公告
   - Twitter 发布
   - Reddit / 2+2 帖子
```

### 10.2 Release Notes 模板

```markdown
## What's Changed

### 🚀 New Features
- Feature description (#PR)

### 🐛 Bug Fixes
- Fix description (#PR)

### ⚡ Performance
- Performance improvement (#PR)

### 📚 Documentation
- Doc update (#PR)

### 🔧 Maintenance
- Dependency updates, refactors (#PR)

## Contributors
Thanks to @user1, @user2, @user3 for their contributions!

## Assets
- Source code (zip)
- Source code (tar.gz)
- poker-suite-cli-x86_64-linux
- poker-suite-cli-x86_64-macos
- poker-suite-cli-x86_64-windows.exe
- poker-suite-desktop-x86_64.AppImage
- poker-suite-desktop-x86_64.dmg
- poker-suite-desktop-x86_64.msi
```

### 10.3 语义化版本

遵循 [SemVer](https://semver.org):
- MAJOR: 破坏性 API 变更
- MINOR: 向后兼容的功能添加
- PATCH: 向后兼容的问题修复

---

## 11. CI/CD 工作流

### 11.1 .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  CARGO_TERM_COLOR: always

jobs:
  # ─── 代码质量检查 ───
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy
      - name: Check formatting
        run: cargo fmt -- --check
      - name: Run Clippy
        run: cargo clippy --all-targets --all-features -- -D warnings

  # ─── Rust 测试 ───
  test-rust:
    name: Test Rust
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        rust: [stable, nightly]
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@master
        with:
          toolchain: ${{ matrix.rust }}
      - name: Cache cargo
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
      - name: Run tests
        run: cargo test --workspace --all-features
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: lcov.info

  # ─── WASM 构建 ───
  build-wasm:
    name: Build WASM
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown
      - name: Install wasm-pack
        run: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
      - name: Build WASM
        run: wasm-pack build crates/poker-core --target web
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: wasm-build
          path: crates/poker-core/pkg

  # ─── 前端测试 ───
  test-web:
    name: Test Web
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build

  # ─── 桌面端构建 ───
  build-desktop:
    name: Build Desktop
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Build Tauri
        run: npm run tauri build
```

### 11.2 .github/workflows/release.yml

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    outputs:
      upload_url: ${{ steps.create_release.outputs.upload_url }}
    steps:
      - uses: actions/checkout@v4
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: true
          prerelease: false

  publish-crates:
    name: Publish to crates.io
    runs-on: ubuntu-latest
    needs: create-release
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - name: Publish
        run: cargo publish --token ${{ secrets.CARGO_REGISTRY_TOKEN }}

  publish-npm:
    name: Publish to npm
    runs-on: ubuntu-latest
    needs: create-release
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - name: Build WASM
        run: wasm-pack build crates/poker-core --target web
      - name: Publish SDK
        run: |
          cd packages/sdk
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 11.3 .github/workflows/docs.yml

```yaml
name: Documentation

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy Docs
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Build docs
        run: |
          cd docs
          npm ci
          npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/build
```

---

## 12. Benchmark 自动化

### 12.1 .github/workflows/benchmark.yml

```yaml
name: Benchmark

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  benchmark:
    name: Performance Benchmark
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      
      - name: Run benchmarks
        run: cargo bench --workspace | tee benchmark-output.txt
      
      - name: Compare with main
        uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'cargo'
          output-file-path: benchmark-output.txt
          github-token: ${{ secrets.GITHUB_TOKEN }}
          auto-push: true
          alert-threshold: '150%'
          comment-on-alert: true
          fail-on-alert: true
          alert-comment-cc-users: '@poker-suite/maintainers'
```

### 12.2 性能回归检测

- 每次 PR 自动运行 benchmark
- 与 main 分支对比
- 性能下降 > 10% 时自动标记 PR
- 性能下降 > 50% 时阻止合并

---

## 13. Documentation 站点

### 13.1 技术选型

- **框架**: Docusaurus 3.x
- **主题**: 自定义深色主题（与仓库视觉一致）
- **部署**: GitHub Pages (docs.poker-suite.dev)
- **搜索**: Algolia DocSearch
- **国际化**: 10+ 语言

### 13.2 站点结构

```
docs/
├── docusaurus.config.ts
├── sidebars.ts
├── src/
│   ├── components/
│   │   ├── BenchmarkChart.tsx
│   │   ├── HeroBanner.tsx
│   │   └── FeatureMatrix.tsx
│   ├── css/
│   │   └── custom.css
│   └── pages/
│       └── index.tsx
├── docs/
│   ├── intro.md
│   ├── getting-started/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   └── configuration.md
│   ├── guides/
│   │   ├── equity-calculation.md
│   │   ├── range-analysis.md
│   │   ├── solver.md
│   │   └── ai-coach.md
│   ├── api/
│   │   ├── rest.md
│   │   ├── grpc.md
│   │   ├── sdk-js.md
│   │   └── sdk-python.md
│   ├── contributing/
│   │   ├── how-to-contribute.md
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   └── benchmark.md
│   └── architecture/
│       ├── overview.md
│       ├── evaluator.md
│       ├── equity.md
│       └── solver.md
├── static/
│   ├── img/
│   │   ├── logo.svg
│   │   ├── banner.svg
│   │   └── favicon.ico
│   └── benchmarks/
│       └── latest.json
└── i18n/
    ├── zh-CN/
    ├── ja/
    ├── ko/
    └── ...
```

---

## 14. Good First Issue

### 14.1 标签策略

| 标签 | 颜色 | 用途 |
|:-----|:----:|:-----|
| `good first issue` | #7057ff | 新手友好的任务 |
| `help wanted` | #008672 | 需要社区帮助 |
| `beginner` | #c2e0c6 | 简单任务 |
| `documentation` | #0075ca | 文档改进 |
| `good first issue: rust` | #7057ff | Rust 相关 |
| `good first issue: web` | #7057ff | 前端相关 |
| `good first issue: docs` | #7057ff | 文档相关 |

### 14.2 新手引导流程

```
1. 用户发现项目
   → README 中的 "Contributing" 链接
   → "Good First Issues" 标签

2. 用户选择任务
   → Issue 有清晰的描述
   → 有 "Getting Started" 指引
   → 有维护者 @mention 愿意指导

3. 用户提交 PR
   → 自动运行 CI
   → 维护者友好 review
   → 合并后欢迎消息

4. 用户成为贡献者
   → 添加到 CONTRIBUTORS.md
   → Discord 贡献者角色
   → 邀请参加核心开发
```

### 14.3 维护者响应 SLA

| 类型 | 响应时间 |
|:-----|:--------:|
| Good First Issue 提问 | 24 小时内 |
| Bug Report | 48 小时内 |
| Feature Request | 72 小时内 |
| PR Review | 48 小时内 |

---

## 15. Hacktoberfest

### 15.1 参与策略

```markdown
# 🎃 Hacktoberfest 2026

欢迎参与 Poker Suite 的 Hacktoberfest！

## 如何参与

1. 注册 [Hacktoberfest](https://hacktoberfest.com)
2. Fork 本仓库
3. 从 [Good First Issues](https://github.com/poker-suite/poker-suite/labels/hacktoberfest) 中选择任务
4. 提交 PR（4 个有效 PR = 免费 T-shirt/植树）

## 任务列表

### 🔰 Beginner
- [ ] 添加西班牙语翻译 (#xxx)
- [ ] 改进 CLI 输出格式 (#xxx)
- [ ] 添加更多扑克平台 HH 解析器 (#xxx)

### 🎯 Intermediate
- [ ] 实现新的范围过滤器 (#xxx)
- [ ] 优化 WASM 绑定性能 (#xxx)
- [ ] 添加更多 Equity 测试用例 (#xxx)

### 🚀 Advanced
- [ ] 实现 Omaha 评估器 (#xxx)
- [ ] GPU 加速 Monte Carlo (#xxx)
- [ ] 分布式 Solver (#xxx)

## 规则

- PR 必须在 10 月 1-31 日提交
- 必须遵循 [CONTRIBUTING.md](CONTRIBUTING.md)
- 低质量 PR（如仅修改空格）将被标记为 `spam`
- 有问题？在 [Discord](https://discord.gg/pokersuite) 提问

## 奖励

- 4 个有效 PR → Hacktoberfest 奖励
- 最佳 PR → Poker Suite 限量周边
- 最多贡献者 → 核心团队邀请
```

### 15.2 Hacktoberfest 标签

- `hacktoberfest` — 项目参与标签
- `hacktoberfest-accepted` — PR 被接受标签
- `spam` — 低质量 PR（避免计入）

---

## 16. GitHub Actions

### 16.1 工作流总览

| 工作流 | 触发条件 | 功能 |
|:-------|:---------|:-----|
| `ci.yml` | Push/PR to main | 代码质量 + 测试 |
| `release.yml` | Tag push | 发布到 crates.io/npm |
| `docs.yml` | Push to main | 部署文档站点 |
| `benchmark.yml` | Push/PR to main | 性能基准测试 |
| `stale.yml` | 定时 (daily) | 关闭闲置 Issue/PR |
| `welcome.yml` | 新 Issue/PR | 欢迎消息 |
| `dependency-review.yml` | PR | 依赖安全检查 |
| `codeql.yml` | 定时 (weekly) | 安全扫描 |

### 16.2 .github/workflows/welcome.yml

```yaml
name: Welcome

on:
  issues:
    types: [opened]
  pull_request_target:
    types: [opened]

jobs:
  welcome:
    name: Welcome
    runs-on: ubuntu-latest
    steps:
      - uses: actions/first-interaction@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          issue-message: |
            👋 Welcome to Poker Suite!
            
            Thanks for opening your first issue! We'll review it soon.
            
            📖 [Documentation](https://docs.poker-suite.dev)
            💬 [Discord](https://discord.gg/pokersuite)
          pr-message: |
            🎉 Welcome to Poker Suite!
            
            Thanks for your first PR! Our maintainers will review it shortly.
            
            📖 [Contributing Guide](https://github.com/poker-suite/poker-suite/blob/main/CONTRIBUTING.md)
            💬 [Discord](https://discord.gg/pokersuite)
```

---

## 17. Sponsor 赞助

### 17.1 .github/FUNDING.yml

```yaml
# GitHub Sponsors
github: [poker-suite]

# Ko-fi
ko_fi: pokersuite

# Open Collective
open_collective: poker-suite

# Patreon
patreon: pokersuite

# 加密货币
# custom: ["https://poker-suite.dev/donate"]
```

### 17.2 Sponsor 展示

```markdown
## 💖 Sponsors

Poker Suite is built by the community. Your support helps us build the best open-source poker platform.

### 🥇 Gold Sponsors

<a href="https://sponsor1.com">
  <img src="https://raw.githubusercontent.com/poker-suite/poker-suite/main/assets/sponsors/gold1.svg" width="200" alt="Sponsor 1">
</a>

### 🥈 Silver Sponsors

<p>
  <a href="https://sponsor2.com">
    <img src="https://raw.githubusercontent.com/poker-suite/poker-suite/main/assets/sponsors/silver1.svg" width="150" alt="Sponsor 2">
  </a>
  <a href="https://sponsor3.com">
    <img src="https://raw.githubusercontent.com/poker-suite/poker-suite/main/assets/sponsors/silver2.svg" width="150" alt="Sponsor 3">
  </a>
</p>

### ☕ Individual Sponsors

<a href="https://github.com/sponsors/poker-suite">
  <img src="https://opencollective.com/poker-suite/backers.svg?width=890" alt="Individual Sponsors">
</a>

### 赞助者权益

| 等级 | 金额 | 权益 |
|:-----|:----:|:-----|
| 🌟 Star | $5/月 | 名字在 README |
| 🥉 Bronze | $50/月 | Logo + 链接 |
| 🥈 Silver | $200/月 | 大尺寸 Logo + 链接 + Discord 专属频道 |
| 🥇 Gold | $500/月 | 以上 + 优先支持 + 路线图投票权 |
| 💎 Platinum | $2000/月 | 以上 + 定制开发 + 私有咨询 |
```

---

## 18. GitHub Trending 增长策略

### 18.1 触发 GitHub Trending 的条件

GitHub Trending 算法考虑：
1. **Stars 增速** — 最重要的是近期获得的 stars 数量
2. **Forks** — 表示项目被实际使用
3. **Contributors** — 社区活跃度
4. **Issues/PRs** — 讨论热度
5. **语言检测** — Rust + TypeScript 双语言标签

### 18.2 增长策略

#### 发布日策略 (Launch Day)

```
T-7 天: 准备阶段
  • 完成核心功能
  • 完善 README
  • 准备 Demo GIF
  • 设置 CI/CD
  
T-3 天: 预热阶段
  • 在 Discord/Twitter 预告
  • 联系扑克社区 KOL
  • 准备发布帖内容
  
T-0 天: 正式发布
  • Hacker News 发布 (Show HN)
  • Reddit (r/poker, r/rust, r/webdev)
  • Twitter 发布 (带 GIF)
  • 2+2 论坛发布
  • Discord 公告
  • 邮件列表通知
  
T+1 天: 跟进
  • 回复所有评论
  • 处理 Bug 报告
  • 感谢贡献者
  • 分享用户反馈
  
T+7 天: 持续
  • 发布 v0.1.1 修复
  • 发布教程博客
  • 接受媒体采访
```

#### 持续增长策略

| 渠道 | 频率 | 内容 |
|:-----|:----:|:-----|
| **Hacker News** | 每次大版本 | Show HN + 性能基准 |
| **Reddit** | 每周 | r/poker, r/rust, r/webdev |
| **Twitter** | 每日 | 开发进度, 小技巧, 社区亮点 |
| **Discord** | 实时 | 社区支持, 开发者交流 |
| **Blog** | 每周 | 技术深度文章 |
| **YouTube** | 每月 | 教程视频 |
| **Newsletter** | 每月 | 项目更新 |
| **Podcast** | 季度 | 开发者访谈 |

#### 内容营销日历

| 周 | 主题 | 渠道 |
|:--:|:-----|:-----|
| 1 | 项目发布 + 性能基准 | HN, Reddit, Twitter |
| 2 | "如何计算扑克权益" 教程 | Blog, YouTube |
| 3 | Rust + WASM 技术深度 | Blog, HN |
| 4 | 社区贡献者采访 | Twitter, Blog |
| 5 | "构建扑克 Solver" 系列 | Blog, YouTube |
| 6 | MCP Server 集成指南 | Blog, Twitter |
| 7 | 性能优化案例研究 | Blog, HN |
| 8 | 月度回顾 + 路线图 | Blog, Newsletter |

### 18.3 Trending 监控

```yaml
# .github/workflows/trending.yml
name: Trending Monitor

on:
  schedule:
    - cron: '0 */6 * * *'  # 每 6 小时检查

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check GitHub Trending
        run: |
          curl -s https://github.com/trending/rust | grep -i "poker-suite" || true
          curl -s https://github.com/trending/typescript | grep -i "poker-suite" || true
      - name: Notify Discord
        if: success()
        run: |
          curl -X POST ${{ secrets.DISCORD_WEBHOOK }}             -H "Content-Type: application/json"             -d '{"content":"🎉 Poker Suite is trending on GitHub!"}'
```

### 18.4 增长指标仪表板

| 指标 | 1 周 | 1 月 | 3 月 | 6 月 | 12 月 |
|:-----|:----:|:----:|:----:|:----:|:-----:|
| Stars | 100 | 500 | 2000 | 5000 | 15000 |
| Forks | 20 | 100 | 400 | 1000 | 3000 |
| Contributors | 5 | 20 | 50 | 100 | 200 |
| Issues | 10 | 50 | 150 | 300 | 500 |
| PRs | 5 | 30 | 100 | 200 | 400 |
| MAU | 100 | 1000 | 5000 | 15000 | 50000 |
| npm downloads | 50 | 500 | 3000 | 10000 | 50000 |
| crates.io downloads | 50 | 300 | 1500 | 5000 | 20000 |

---

> **文档结束**。本设计文档为 Poker Suite 的 GitHub 仓库提供了完整的呈现层设计，从视觉设计到社区运营，从 CI/CD 到增长策略，全面覆盖。目标是打造一个能登上 GitHub Trending 的开源项目。