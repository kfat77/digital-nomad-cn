<p align="center">
  <img src="https://raw.githubusercontent.com/kfat77/openpoker/main/assets/logo.svg" width="120" alt="OpenPoker">
</p>

<h1 align="center">♠️ OpenPoker</h1>

<p align="center">
  <b>The Open Poker Intelligence Platform</b><br>
  <sub>Open source · AI-Native · Blazing fast · Extensible to any game</sub>
</p>

<p align="center">
  <a href="https://github.com/kfat77/openpoker/stargazers"><img src="https://img.shields.io/github/stars/kfat77/openpoker?style=flat-square&color=ffd700" alt="Stars"></a>
  <a href="https://github.com/kfat77/openpoker/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-00d4aa?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/Rust-🦀-dea584?style=flat-square" alt="Rust">
  <img src="https://img.shields.io/badge/WASM-🕸️-654ff0?style=flat-square" alt="WASM">
  <img src="https://img.shields.io/badge/MCP-🤖-ff6b6b?style=flat-square" alt="MCP">
</p>

---

## 🚨 Project Status: Design Phase

> **⚠️ This project is currently in the design/architecture phase.**
>
> All design documents are complete and available in the [`design/`](design/) directory.
> Code implementation will begin once the design review is complete.
>
> **Estimated first code commit:** 2026 Q3

## 📐 Design Blueprints

| Document | Description |
|:---------|:------------|
| [01 · Audit Report](design/01-audit-report.md) | Comprehensive audit of the original project |
| [02 · Architecture](design/02-architecture-design.md) | 5-layer system architecture with 14 subsystems |
| [03 · Algorithms](design/03-algorithm-design.md) | 12 algorithms: Evaluator, MC, CFR, ICM, etc. |
| [04 · Agent-Native](design/04-agent-native-design.md) | OpenAPI, MCP, RAG, Multi-Agent, Vision |
| [05 · GitHub Design](design/05-github-repo-design.md) | Repo design targeting GitHub Trending |
| [06 · Growth Strategy](design/06-growth-strategy.md) | 10K Stars growth playbook across 13 channels |
| [07 · Branding](design/07-branding-strategy.md) | Rebrand from texas-holdem-calculator to OpenPoker |
| [08 · Roadmap](design/08-36-month-roadmap.md) | 36-month roadmap to Open Poker Intelligence Platform |

## 🏗️ Monorepo Structure

```
openpoker/
├── crates/          # Rust core crates
│   ├── poker-types/     # Core types (Card, Hand, Deck)
│   ├── poker-eval/      # Hand evaluator (Perfect Hash)
│   ├── poker-equity/    # Equity calculation (MC + Exact)
│   ├── poker-range/     # Range operations (1326-bit mask)
│   ├── poker-solver/    # GTO solver (DCFR)
│   ├── poker-parser/    # Hand history parser
│   ├── poker-trainer/   # Training/drill engine
│   └── openpoker/       # Re-export core
├── packages/        # TypeScript packages
│   ├── @openpoker/core/     # WASM bindings
│   ├── @openpoker/sdk/      # TypeScript SDK
│   └── @openpoker/mcp-server/  # MCP Server
├── apps/            # Applications
│   ├── web/             # React 19 + PWA
│   ├── desktop/         # Tauri v2
│   └── cli/             # Rust CLI
├── api/             # OpenAPI + gRPC specs
├── agent/           # Python + LangGraph agents
├── docs/            # Docusaurus documentation
└── design/          # 📐 Design documents
```

## 🚀 Quick Start (Coming Soon)

```bash
# CLI
cargo install openpoker-cli
openpoker equity --hero AsKh --villain JJ+ --board Ts9d2h

# SDK
npm install @openpoker/sdk

# MCP Server
npm install -g @openpoker/mcp-server
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

We welcome contributors of all levels! Check out our [Good First Issues](https://github.com/kfat77/openpoker/labels/good%20first%20issue) to get started.

## 📜 License

MIT © [OpenPoker Contributors](https://github.com/kfat77/openpoker/graphs/contributors)

---

<p align="center">
  <i>Built with ♠️ by the community. Open source, open standards, open to any game.</i>
</p>
