# Contributing to OpenPoker

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/openpoker.git`
3. Install Rust (1.80+) and Node.js (20+)
4. Install pnpm: `npm install -g pnpm`

## Development Setup

```bash
# Rust crates
cd crates/openpoker
cargo test

# TypeScript packages
pnpm install
pnpm build
pnpm test
```

## Project Structure

- `crates/` — Rust core libraries
- `packages/` — TypeScript packages
- `apps/` — Applications (Web, Desktop, CLI)
- `design/` — Design documents

## Pull Request Process

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Run tests: `cargo test` and `pnpm test`
4. Commit with clear messages
5. Push and open a PR

## Code Style

- Rust: Follow `rustfmt` and `clippy`
- TypeScript: Follow Prettier config

## Questions?

Join our [Discord](https://discord.gg/openpoker) or open a Discussion.
