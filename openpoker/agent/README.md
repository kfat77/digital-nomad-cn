# OpenPoker AI Agent

Python-based AI agents using LangGraph + MCP for poker coaching and analysis.

## Setup

```bash
cd agent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Architecture

- **Poker Coach Agent**: Real-time coaching during play
- **Hand Reviewer Agent**: Post-session hand analysis
- **Trainer Agent**: Spaced repetition drills
- **Solver Guru Agent**: GTO strategy queries
