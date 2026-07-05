# Poker Suite — Agent-Native Architecture (2028)

> **时间设定**: 2028年 — Agent 时代  
> **核心原则**: AI Agent 可以直接调用整个 Poker Engine  
> **架构范式**: Agent-Native（AI 优先，人类通过自然语言与 Agent 交互）

---

## 目录

1. [架构总览](#一架构总览)
2. [OpenAPI 设计](#二openapi-设计)
3. [MCP 协议层](#三mcp-协议层)
4. [RAG 知识引擎](#四rag-知识引擎)
5. [多 Agent 角色体系](#五多-agent-角色体系)
6. [多模态输入系统](#六多模态输入系统)
7. [实时分析引擎](#七实时分析引擎)
8. [Replay 系统](#八replay-系统)
9. [Agent 编排与记忆](#九agent-编排与记忆)
10. [安全与合规](#十安全与合规)

---

## 一、架构总览

### 1.1 2028 年的技术假设

- **LLM 已 commoditized**: GPT-5/Claude 4/Gemini 3 级别的模型成为基础设施
- **Agent 协议标准化**: MCP (Model Context Protocol) 成为 AI 工具连接的事实标准
- **多模态原生**: 语音/视觉/文本的融合输入成为默认
- **边缘计算成熟**: 手机端可运行 70B 参数模型，浏览器 WASM 性能接近原生
- **实时流式**: SSE/WebSocket/QUIC 成为实时交互的标准传输层

### 1.2 Agent-Native 架构定义

传统架构：人类 → UI → API → Engine  
Agent-Native 架构：**人类 → Agent → MCP Tools → Engine**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENT-NATIVE ARCHITECTURE                           │
│                                                                             │
│  ┌─────────┐     ┌──────────────┐     ┌─────────────────────────────────┐  │
│  │  Human  │────→│   Agent      │────→│  MCP Tool Registry              │  │
│  │         │ NL  │  Orchestrator│     │  (poker_equity,                 │  │
│  │         │←────│              │←────│   poker_range,                  │  │
│  └─────────┘     └──────┬───────┘     │   poker_solve,                  │  │
│                         │             │   poker_review, ...)            │  │
│                         │             └─────────────────────────────────┘  │
│                         │                         │                        │
│  ┌──────────────────────┼───────────────────────┼────────────────────┐   │
│  │                      ▼                       ▼                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │Equity    │  │Range     │  │Solver    │  │Parser    │        │   │
│  │  │Engine    │  │Engine    │  │Engine    │  │Engine    │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │Trainer   │  │Review    │  │Database  │  │Replayer  │        │   │
│  │  │Engine    │  │Engine    │  │Engine    │  │Engine    │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │              RAG KNOWLEDGE BASE                          │   │   │
│  │  │  GTO Docs │ Strategy DB │ Hand Histories │ Video Corpus │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │              MULTIMODAL INPUT LAYER                      │   │   │
│  │  │  Voice │ Vision/Screenshot │ OCR │ Desktop API │ Mouse  │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │              MEMORY SYSTEM                               │   │   │
│  │  │  Short-term (Session) │ Long-term (Player Profile)       │   │   │
│  │  │  Episodic (Hands)     │ Semantic (Strategy Knowledge)    │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 核心设计原则

| 原则 | 含义 | 实现 |
|:-----|:-----|:-----|
| **Tool-First** | 每个功能都是 Agent 可调用的 Tool | MCP Server 暴露全部能力 |
| **Composability** | Agent 可以组合多个 Tools 完成复杂任务 | ReAct + 工具链 |
| **Stream-Native** | 所有输出都是流式的 | SSE/WebSocket/QUIC |
| **Stateless Engine** | 引擎无状态，Agent 管理上下文 | 每次调用携带完整状态 |
| **Multimodal I/O** | 支持语音/视觉/文本的任意组合 | 统一的多模态管道 |
| **Real-Time** | 延迟 < 100ms 的实时响应 | 边缘缓存 + 预计算 |

---

## 二、OpenAPI 设计

### 2.1 设计哲学

2028 年的 API 设计遵循 **"AI-First, Human-Compatible"** 原则：
- API 首先是给 AI Agent 调用的
- 人类可以通过自然语言让 Agent 调用 API
- 每个端点都有对应的 MCP Tool 映射

### 2.2 OpenAPI 3.1 规范

```yaml
openapi: 3.1.0
info:
  title: Poker Suite API
  version: 2028.1.0
  description: |
    Agent-Native Poker Intelligence API.
    
    Every endpoint is also available as an MCP Tool.
    AI Agents can call these endpoints directly through the MCP protocol.
    
    Base URL: https://api.poker-suite.dev/v2
    
    ## Authentication
    All endpoints require an API key passed in the `Authorization` header:
    ```
    Authorization: Bearer {your_api_key}
    ```
    
    ## Rate Limits
    - Free: 100 requests/day
    - Pro: 10,000 requests/day
    - Enterprise: Unlimited
    
    ## Streaming
    All calculation endpoints support streaming via SSE:
    ```
    GET /v2/equity/stream
    Accept: text/event-stream
    ```

servers:
  - url: https://api.poker-suite.dev/v2
    description: Production
  - url: https://staging-api.poker-suite.dev/v2
    description: Staging

security:
  - BearerAuth: []

paths:

  # ═══════════════════════════════════════════════════════════════
  # EQUITY CALCULATION
  # ═══════════════════════════════════════════════════════════════

  /equity:
    post:
      operationId: calculateEquity
      summary: Calculate equity for a hand vs opponent ranges
      description: |
        Calculate the equity (win probability) of a hand against one or more opponent ranges.
        
        **Agent Use Case**: Agent asks "What's my equity with AKs on this board?"
        → Calls this endpoint with hero hand, villain ranges, and board.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EquityRequest'
            examples:
              basic:
                summary: Basic 2-way equity
                value:
                  hero: "AsKh"
                  villains:
                    - range: "JJ+"
                      weight: 1.0
                  board: "Ts9d2h"
                  method: "auto"
                  iterations: 100000
              multiway:
                summary: 3-way pot
                value:
                  hero: "AsKh"
                  villains:
                    - range: "JJ+"
                    - range: "TT-88,AKs-AQs"
                  board: "Ts9d2h"
                  dead: ""
                  method: "monte_carlo"
                  iterations: 500000
      responses:
        '200':
          description: Equity calculation result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EquityResult'
        '400':
          $ref: '#/components/responses/BadRequest'
        '429':
          $ref: '#/components/responses/RateLimited'

  /equity/stream:
    post:
      operationId: calculateEquityStream
      summary: Stream equity calculation progress
      description: |
        Stream equity calculation in real-time.
        Returns SSE events with running estimates and final result.
        
        **Agent Use Case**: Agent shows user "Calculating... 47.1% (50K/100K)"
        → Streams progress until converged.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EquityRequest'
      responses:
        '200':
          description: SSE stream of progress events
          content:
            text/event-stream:
              schema:
                $ref: '#/components/schemas/EquityStreamEvent'

  /equity/batch:
    post:
      operationId: calculateEquityBatch
      summary: Batch equity calculations
      description: Calculate equity for multiple scenarios in parallel.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                requests:
                  type: array
                  items:
                    $ref: '#/components/schemas/EquityRequest'
                  maxItems: 100
      responses:
        '200':
          description: Batch results
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      $ref: '#/components/schemas/EquityResult'

  # ═══════════════════════════════════════════════════════════════
  # RANGE OPERATIONS
  # ═══════════════════════════════════════════════════════════════

  /range/parse:
    post:
      operationId: parseRange
      summary: Parse a range string into structured data
      description: |
        Parse poker range notation into a structured representation.
        
        **Agent Use Case**: Agent parses user's verbal range description
        → "Any pair, AK suited, and AQ off or better" → structured range
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                range:
                  type: string
                  description: Range text (e.g., "AA,AKs,AQo+,66-99,T5s+")
                  example: "AA,AKs,AQo+,66-99"
      responses:
        '200':
          description: Parsed range
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RangeData'

  /range/analyze:
    post:
      operationId: analyzeRange
      summary: Analyze a range's properties
      description: |
        Get detailed analysis of a range including:
        - Hand category breakdown (pairs, suited, offsuit)
        - Board texture interaction
        - Equity vs other ranges
        
        **Agent Use Case**: Agent explains "This range is 15.2% of all hands,
        heavily weighted toward Broadway cards and pairs."
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                range:
                  type: string
                board:
                  type: string
                  nullable: true
                vs_range:
                  type: string
                  nullable: true
      responses:
        '200':
          description: Range analysis
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RangeAnalysis'

  /range/advice:
    post:
      operationId: getRangeAdvice
      summary: Get GTO range advice for a position
      description: |
        Query recommended range for a given position and action.
        
        **Agent Use Case**: Agent answers "What should I open from UTG?"
        → Queries GTO database for UTG open range
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                position:
                  type: string
                  enum: [UTG, UTG+1, MP, MP+1, HJ, CO, BTN, SB, BB]
                action:
                  type: string
                  enum: [open, limp, call, 3bet, 4bet, 5bet, defend]
                stack_depth:
                  type: number
                  description: Stack in big blinds
                ante:
                  type: boolean
                table_size:
                  type: integer
                  enum: [6, 8, 9]
      responses:
        '200':
          description: GTO range advice
          content:
            application/json:
              schema:
                type: object
                properties:
                  range:
                    type: string
                  percent:
                    type: number
                  combos:
                    type: integer
                  strategy:
                    type: array
                    items:
                      type: object
                      properties:
                        hand_category:
                          type: string
                        action:
                          type: string
                        frequency:
                          type: number

  # ═══════════════════════════════════════════════════════════════
  # SOLVER
  # ═══════════════════════════════════════════════════════════════

  /solver/spots:
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
        - name: action
          in: query
          schema: { type: string }
      responses:
        '200':
          description: List of spots

  /solver/strategy:
    get:
      operationId: getSolverStrategy
      summary: Get GTO strategy for a specific spot
      description: |
        Retrieve pre-computed GTO strategy for a given game state.
        
        **Agent Use Case**: Agent answers "How should I play AK on Ts9d2h as BTN vs BB?"
      parameters:
        - name: spot_id
          in: query
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Strategy data
          content:
            application/json:
              schema:
                type: object
                properties:
                  spot:
                    type: object
                  strategy:
                    type: array
                    items:
                      type: object
                      properties:
                        hand:
                          type: string
                        actions:
                          type: array
                          items:
                            type: object
                            properties:
                              action:
                                type: string
                              frequency:
                                type: number
                              ev:
                                type: number

  /solver/solve:
    post:
      operationId: requestSolve
      summary: Request a new GTO solve
      description: |
        Submit a new game tree for solving.
        Returns a job ID for polling or streaming.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                tree_config:
                  type: object
                  properties:
                    position:
                      type: string
                    board:
                      type: string
                    stack_depth:
                      type: number
                    pot_size:
                      type: number
                    bet_sizes:
                      type: array
                      items: { type: number }
                convergence:
                  type: number
                  description: Target exploitability (default 0.001)
      responses:
        '202':
          description: Solve job accepted
          content:
            application/json:
              schema:
                type: object
                properties:
                  job_id:
                    type: string
                  status:
                    type: string
                    enum: [queued, running, completed, failed]

  /solver/jobs/{job_id}:
    get:
      operationId: getSolveJob
      summary: Get solve job status
      parameters:
        - name: job_id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Job status

  /solver/jobs/{job_id}/stream:
    get:
      operationId: streamSolveJob
      summary: Stream solve progress
      parameters:
        - name: job_id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: SSE stream
          content:
            text/event-stream:
              schema:
                type: object

  # ═══════════════════════════════════════════════════════════════
  # HAND HISTORY & REPLAY
  # ═══════════════════════════════════════════════════════════════

  /hands/parse:
    post:
      operationId: parseHandHistory
      summary: Parse raw hand history text
      description: |
        Parse poker hand history from any supported site.
        Auto-detects site format.
        
        **Agent Use Case**: Agent reads user's hand history file
        → Parses → Stores → Available for analysis
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                text:
                  type: string
                  description: Raw hand history text
                site:
                  type: string
                  enum: [auto, pokerstars, ggpoker, partypoker, ignition, 888, acpc]
                  default: auto
      responses:
        '200':
          description: Parsed hands
          content:
            application/json:
              schema:
                type: object
                properties:
                  hands:
                    type: array
                    items:
                      $ref: '#/components/schemas/HandHistory'
                  site_detected:
                    type: string
                  parse_time_ms:
                    type: integer

  /hands/{hand_id}/review:
    get:
      operationId: reviewHand
      summary: AI-powered hand review
      description: |
        Generate comprehensive AI review of a specific hand.
        
        **Agent Use Case**: Agent reviews user's hand and explains:
        "On the flop with top pair top kicker, your cbet is standard.
        However, on the turn when the flush completes, checking back
        is preferred against this opponent's range..."
      parameters:
        - name: hand_id
          in: path
          required: true
          schema: { type: string }
        - name: depth
          in: query
          schema:
            type: string
            enum: [basic, standard, deep, gto]
            default: standard
      responses:
        '200':
          description: AI review
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HandReview'

  /hands/{hand_id}/replay:
    get:
      operationId: replayHand
      summary: Interactive hand replay
      description: |
        Get hand data formatted for replay.
        Includes timing, actions, and AI commentary.
      parameters:
        - name: hand_id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Replay data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HandReplay'

  /hands/query:
    post:
      operationId: queryHands
      summary: Query hand database
      description: |
        Search hands with natural language or structured filters.
        
        **Agent Use Case**: Agent understands "Show me my biggest losing
        hands from last month where I had AK" → structured query
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: Natural language query
                  example: "biggest losses last month with AK"
                filters:
                  type: object
                  properties:
                    date_from:
                      type: string
                      format: date
                    date_to:
                      type: string
                      format: date
                    hero_hand:
                      type: string
                    result_min:
                      type: number
                    result_max:
                      type: number
                    position:
                      type: string
                limit:
                  type: integer
                  default: 50
                  maximum: 500
      responses:
        '200':
          description: Query results

  # ═══════════════════════════════════════════════════════════════
  # SESSION & ANALYTICS
  # ═══════════════════════════════════════════════════════════════

  /sessions:
    get:
      operationId: listSessions
      summary: List poker sessions
      parameters:
        - name: from
          in: query
          schema: { type: string, format: date }
        - name: to
          in: query
          schema: { type: string, format: date }
        - name: game_type
          in: query
          schema: { type: string }
      responses:
        '200':
          description: Sessions list

  /sessions/{session_id}/analysis:
    get:
      operationId: analyzeSession
      summary: AI session analysis
      description: |
        Comprehensive AI analysis of a session.
        Identifies leaks, patterns, and improvement areas.
      parameters:
        - name: session_id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Session analysis
          content:
            application/json:
              schema:
                type: object
                properties:
                  summary:
                    type: string
                    description: Natural language summary
                  stats:
                    type: object
                  leaks:
                    type: array
                    items:
                      type: object
                      properties:
                        category:
                          type: string
                        severity:
                          type: string
                          enum: [low, medium, high, critical]
                        description:
                          type: string
                        recommendation:
                          type: string
                  highlights:
                    type: array
                    items:
                      type: object
                      properties:
                        hand_id:
                          type: string
                        description:
                          type: string
                        type:
                          type: string
                          enum: [best_play, mistake, interesting]

  # ═══════════════════════════════════════════════════════════════
  # AI COACH
  # ═══════════════════════════════════════════════════════════════

  /coach/chat:
    post:
      operationId: coachChat
      summary: Chat with AI Poker Coach
      description: |
        Send a message to the AI Poker Coach.
        Supports follow-up questions and context memory.
        
        **Agent Use Case**: Primary interface for human users.
        "Should I fold AKs to a 3bet from a tight player?"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                session_id:
                  type: string
                  description: Conversation session ID
                context:
                  type: object
                  properties:
                    current_hand:
                      type: string
                    position:
                      type: string
                    stack_depth:
                      type: number
                    game_type:
                      type: string
      responses:
        '200':
          description: Coach response
          content:
            application/json:
              schema:
                type: object
                properties:
                  response:
                    type: string
                  tools_called:
                    type: array
                    items:
                      type: object
                      properties:
                        tool:
                          type: string
                        result:
                          type: object
                  suggested_actions:
                    type: array
                    items:
                      type: string

  /coach/stream:
    post:
      operationId: coachChatStream
      summary: Stream chat with AI Poker Coach
      description: |
        Stream coach response in real-time.
        Each SSE event contains a chunk of the response.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                session_id:
                  type: string
      responses:
        '200':
          description: SSE stream of response chunks
          content:
            text/event-stream:
              schema:
                type: object
                properties:
                  type:
                    type: string
                    enum: [thinking, tool_call, tool_result, text, done]
                  content:
                    type: string
                  tool_name:
                    type: string
                  tool_result:
                    type: object

  /coach/voice:
    post:
      operationId: coachVoice
      summary: Voice interaction with AI Coach
      description: |
        Send audio and receive audio response.
        Automatic speech recognition and text-to-speech.
      requestBody:
        required: true
        content:
          audio/wav:
            schema:
              type: string
              format: binary
          audio/webm:
            schema:
              type: string
              format: binary
      responses:
        '200':
          description: Audio response
          content:
            audio/wav:
              schema:
                type: string
                format: binary

  # ═══════════════════════════════════════════════════════════════
  # VISION & DESKTOP
  # ═══════════════════════════════════════════════════════════════

  /vision/analyze:
    post:
      operationId: analyzeScreenshot
      summary: Analyze a poker table screenshot
      description: |
        Upload a screenshot of a poker table.
        AI will identify cards, positions, stacks, and actions.
        
        **Agent Use Case**: Agent sees user's screen and says:
        "I see you have AKs on BTN, the board is Ts9d2h,
        and the pot is 15BB. Your equity is 47.3%."
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                image:
                  type: string
                  format: binary
                  description: Screenshot image (PNG/JPG)
                site:
                  type: string
                  enum: [auto, pokerstars, ggpoker, partypoker, ignition, acr]
                  default: auto
      responses:
        '200':
          description: Analyzed game state
          content:
            application/json:
              schema:
                type: object
                properties:
                  detected:
                    type: boolean
                  confidence:
                    type: number
                  game_state:
                    type: object
                    properties:
                      hero_hand:
                        type: string
                      board:
                        type: string
                      position:
                        type: string
                      stack:
                        type: number
                      pot:
                        type: number
                      to_call:
                        type: number
                      players:
                        type: array
                        items:
                          type: object
                          properties:
                            position:
                              type: string
                            stack:
                              type: number
                            action:
                              type: string
                  analysis:
                    type: object
                    properties:
                      equity:
                        type: number
                      pot_odds:
                        type: number
                      recommendation:
                        type: string

  /vision/desktop:
    post:
      operationId: connectDesktop
      summary: Connect to desktop poker client
      description: |
        Establish real-time connection to a poker client.
        Supports PokerStars, GG Poker, and other major clients.
        
        **Agent Use Case**: Agent monitors user's game in real-time
        and provides live coaching.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                client:
                  type: string
                  enum: [pokerstars, ggpoker, partypoker, ignition, acr]
                table_id:
                  type: string
                auto_detect:
                  type: boolean
                  default: true
      responses:
        '200':
          description: Connection established
          content:
            application/json:
              schema:
                type: object
                properties:
                  connection_id:
                    type: string
                  status:
                    type: string
                    enum: [connected, disconnected, error]

  /vision/desktop/{connection_id}/stream:
    get:
      operationId: streamDesktop
      summary: Stream real-time desktop analysis
      description: |
        SSE stream of real-time game state analysis.
        Updates on every significant change (new card, action, etc.).
      parameters:
        - name: connection_id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: SSE stream
          content:
            text/event-stream:
              schema:
                type: object
                properties:
                  event:
                    type: string
                    enum: [game_state, action, recommendation, alert]
                  data:
                    type: object

  # ═══════════════════════════════════════════════════════════════
  # REAL-TIME
  # ═══════════════════════════════════════════════════════════════

  /realtime/subscribe:
    post:
      operationId: subscribeRealtime
      summary: Subscribe to real-time analysis
      description: |
        Subscribe to real-time equity and recommendation updates.
        
        **Agent Use Case**: Agent monitors a live game and pushes
        updates to the user as the game progresses.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                game_state:
                  type: object
                  properties:
                    hero_hand:
                      type: string
                    board:
                      type: string
                    position:
                      type: string
                    pot:
                      type: number
                    to_call:
                      type: number
                villain_ranges:
                  type: array
                  items:
                    type: object
                    properties:
                      position:
                        type: string
                      range:
                        type: string
                update_frequency:
                  type: string
                  enum: [instant, action, street]
                  default: action
      responses:
        '200':
          description: Subscription created
          content:
            application/json:
              schema:
                type: object
                properties:
                  subscription_id:
                    type: string
                  ws_url:
                    type: string

  /realtime/{subscription_id}:
    get:
      operationId: getRealtimeStream
      summary: WebSocket stream for real-time analysis
      description: |
        WebSocket connection for real-time updates.
        
        Message types:
        - `equity_update`: Equity has changed
        - `recommendation`: Suggested action
        - `alert`: Important notification
        - `game_state`: Game state update
      parameters:
        - name: subscription_id
          in: path
          required: true
          schema: { type: string }
      responses:
        '101':
          description: WebSocket upgrade

  # ═══════════════════════════════════════════════════════════════
  # TRAINING
  # ═══════════════════════════════════════════════════════════════

  /training/drills:
    get:
      operationId: listDrills
      summary: List available training drills
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [preflop, postflop, equity, odds, reads, icm]
        - name: difficulty
          in: query
          schema:
            type: string
            enum: [beginner, intermediate, advanced, expert]
      responses:
        '200':
          description: Drill list

  /training/drills/{drill_id}/start:
    post:
      operationId: startDrill
      summary: Start a training drill
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                drill_id:
                  type: string
                config:
                  type: object
      responses:
        '200':
          description: Drill started

  /training/drills/{session_id}/answer:
    post:
      operationId: submitAnswer
      summary: Submit answer to a drill question
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                answer:
                  type: string
                time_ms:
                  type: integer
      responses:
        '200':
          description: Answer result

  # ═══════════════════════════════════════════════════════════════
  # WEBSOCKET (Unified)
  # ═══════════════════════════════════════════════════════════════

  /ws:
    get:
      operationId: websocket
      summary: Unified WebSocket endpoint
      description: |
        Single WebSocket connection for all real-time features.
        
        Subscribe to channels:
        ```json
        {"type": "subscribe", "channel": "coach.{session_id}"}
        {"type": "subscribe", "channel": "desktop.{connection_id}"}
        {"type": "subscribe", "channel": "solver.{job_id}"}
        ```
      responses:
        '101':
          description: WebSocket upgrade

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    EquityRequest:
      type: object
      required: [hero, villains]
      properties:
        hero:
          type: string
          description: Hero's hand (e.g., "AsKh")
        villains:
          type: array
          items:
            type: object
            properties:
              range:
                type: string
              weight:
                type: number
                default: 1.0
        board:
          type: string
          description: Community cards (e.g., "Ts9d2h")
        dead:
          type: string
        method:
          type: string
          enum: [exact, monte_carlo, auto]
          default: auto
        iterations:
          type: integer
          default: 100000
        threads:
          type: integer
          default: 0

    EquityResult:
      type: object
      properties:
        equity:
          type: number
        win:
          type: number
        tie:
          type: number
        loss:
          type: number
        total_iterations:
          type: integer
        elapsed_ms:
          type: integer
        method:
          type: string
        convergence:
          type: number
        vs_villains:
          type: array
          items:
            type: object
            properties:
              villain_index:
                type: integer
              equity_vs:
                type: number

    EquityStreamEvent:
      type: object
      properties:
        type:
          type: string
          enum: [progress, result]
        progress:
          type: object
          properties:
            completed:
              type: integer
            total:
              type: integer
            current_equity:
              type: number
        result:
          $ref: '#/components/schemas/EquityResult'

    RangeData:
      type: object
      properties:
        text:
          type: string
        combos:
          type: integer
        percent:
          type: number
        hands:
          type: array
          items:
            type: object
            properties:
              hand:
                type: string
              weight:
                type: number

    RangeAnalysis:
      type: object
      properties:
        range:
          type: string
        combos:
          type: integer
        percent:
          type: number
        breakdown:
          type: object
          properties:
            pairs:
              type: integer
            suited:
              type: integer
            offsuit:
              type: integer
        board_interaction:
          type: object
        equity_vs:
          type: array
          items:
            type: object

    HandHistory:
      type: object
      properties:
        id:
          type: string
        site:
          type: string
        timestamp:
          type: string
          format: date-time
        game_type:
          type: string
        hero_hand:
          type: string
        board:
          type: string
        result:
          type: number
        actions:
          type: array

    HandReview:
      type: object
      properties:
        hand_id:
          type: string
        overall_rating:
          type: string
          enum: [excellent, good, ok, questionable, mistake]
        street_reviews:
          type: array
          items:
            type: object
            properties:
              street:
                type: string
              action:
                type: string
              rating:
                type: string
              explanation:
                type: string
              equity:
                type: number
              recommendation:
                type: string
        summary:
          type: string
        key_lessons:
          type: array
          items: { type: string }

    HandReplay:
      type: object
      properties:
        hand_id:
          type: string
        timeline:
          type: array
          items:
            type: object
            properties:
              timestamp:
                type: number
              event:
                type: string
              data:
                type: object
              commentary:
                type: string
        statistics:
          type: object

  responses:
    BadRequest:
      description: Invalid request
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
              details:
                type: array
                items: { type: string }

    RateLimited:
      description: Rate limit exceeded
      headers:
        X-RateLimit-Limit:
          schema: { type: integer }
        X-RateLimit-Remaining:
          schema: { type: integer }
        X-RateLimit-Reset:
          schema: { type: integer }
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
```

---

## 三、MCP 协议层

### 3.1 MCP Server 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP SERVER                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Transport Layer                                     │   │
│  │  • stdio (CLI integration)                          │   │
│  │  • HTTP/SSE (Remote access)                         │   │
│  │  • WebSocket (Real-time)                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Protocol Handler                                    │   │
│  │  • initialize                                       │   │
│  │  • tools/list                                       │   │
│  │  • tools/call                                       │   │
│  │  • resources/list                                   │   │
│  │  • resources/read                                   │   │
│  │  • prompts/list                                     │   │
│  │  • prompts/get                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tool Registry                                       │   │
│  │                                                     │   │
│  │  Core Tools:                                        │   │
│  │  • poker_calculate_equity                           │   │
│  │  • poker_analyze_range                              │   │
│  │  • poker_parse_hand                                 │   │
│  │  • poker_get_strategy                               │   │
│  │  • poker_review_hand                                │   │
│  │  • poker_query_database                             │   │
│  │                                                     │   │
│  │  Vision Tools:                                      │   │
│  │  • poker_analyze_screenshot                         │   │
│  │  • poker_connect_desktop                            │   │
│  │                                                     │   │
│  │  Training Tools:                                    │   │
│  │  • poker_start_drill                                │   │
│  │  • poker_get_training_progress                      │   │
│  │                                                     │   │
│  │  Resources:                                         │   │
│  │  • strategy://preflop/{position}                    │   │
│  │  • strategy://postflop/{board_texture}              │   │
│  │  • hand-db://{player}/{date}                        │   │
│  │  • player-stats://{player_name}                     │   │
│  │                                                     │   │
│  │  Prompts:                                           │   │
│  │  • poker_review_session                             │   │
│  │  • poker_explain_concept                            │   │
│  │  • poker_analyze_spot                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Poker Engine (Rust Core)                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 MCP Tool 定义

```typescript
// packages/@poker-suite/mcp-server/src/tools/index.ts

import { z } from "zod";

// ─── Core Tools ───

export const pokerCalculateEquity = {
  name: "poker_calculate_equity",
  description: `
    Calculate the equity (win probability) of a poker hand against opponent ranges.
    
    Use this when the user asks about:
    - "What's my equity?"
    - "How often do I win here?"
    - "What are my chances against..."
    - Any question involving hand strength or winning probability
    
    Returns: equity percentage, win/tie/loss breakdown, and vs each villain.
  `,
  parameters: z.object({
    hero_hand: z.string()
      .describe("Hero's hand, e.g., 'AsKh', 'AKs', '77'")
      .regex(/^[2-9TJQKA][shdc][2-9TJQKA][shdc]$/i, "Invalid hand format"),
    villain_ranges: z.array(z.string())
      .describe("Opponent hand ranges, e.g., ['JJ+', 'AQs+', 'KQs']")
      .default(["random"]),
    board: z.string()
      .optional()
      .describe("Community cards, e.g., 'Ts9d2h'"),
    dead_cards: z.string()
      .optional()
      .describe("Known dead cards"),
    method: z.enum(["exact", "monte_carlo", "auto"])
      .default("auto")
      .describe("Calculation method. Auto chooses based on complexity."),
    iterations: z.number()
      .min(100)
      .max(10000000)
      .default(100000)
      .describe("Monte Carlo iterations"),
  }),
  handler: async (params) => {
    const engine = await getEngine();
    return engine.calculateEquity(params);
  },
};

export const pokerAnalyzeRange = {
  name: "poker_analyze_range",
  description: `
    Analyze a poker range and provide detailed statistics.
    
    Use this when the user asks about:
    - "How wide is this range?"
    - "What hands are in this range?"
    - "Break down this range for me"
    - Any question about range composition
  `,
  parameters: z.object({
    range: z.string()
      .describe("Range text, e.g., 'AA,AKs,AQo+,66-99,T5s+'"),
    board: z.string()
      .optional()
      .describe("Optional board for texture analysis"),
  }),
  handler: async (params) => {
    const engine = await getEngine();
    return engine.analyzeRange(params);
  },
};

export const pokerGetStrategy = {
  name: "poker_get_strategy",
  description: `
    Get GTO (Game Theory Optimal) strategy for a specific poker spot.
    
    Use this when the user asks about:
    - "What's the GTO play here?"
    - "How should I play this spot?"
    - "What's the solver say?"
    - Any question about optimal strategy
  `,
  parameters: z.object({
    position: z.enum(["UTG", "UTG+1", "MP", "HJ", "CO", "BTN", "SB", "BB"])
      .describe("Hero's position"),
    action: z.enum(["open", "facing_raise", "facing_3bet", "facing_4bet", "defend_bb"])
      .describe("Current situation"),
    board: z.string()
      .optional()
      .describe("Board cards (if postflop)"),
    stack_depth: z.number()
      .describe("Stack in big blinds")
      .default(100),
    pot_size: z.number()
      .optional()
      .describe("Current pot in BB"),
  }),
  handler: async (params) => {
    const db = await getStrategyDB();
    return db.query(params);
  },
};

export const pokerReviewHand = {
  name: "poker_review_hand",
  description: `
    Perform AI-powered review of a specific poker hand.
    
    Use this when the user asks about:
    - "Review this hand for me"
    - "Did I play this right?"
    - "What should I have done differently?"
    - Any request for hand analysis
  `,
  parameters: z.object({
    hand_id: z.string()
      .optional()
      .describe("Hand ID from database"),
    hand_text: z.string()
      .optional()
      .describe("Raw hand history text"),
    depth: z.enum(["basic", "standard", "deep", "gto"])
      .default("standard")
      .describe("Analysis depth"),
  }),
  handler: async (params) => {
    const reviewer = await getHandReviewer();
    return reviewer.review(params);
  },
};

export const pokerQueryDatabase = {
  name: "poker_query_database",
  description: `
    Query the hand history database with natural language or structured filters.
    
    Use this when the user asks about:
    - "Show me my biggest wins"
    - "How do I do with AK?"
    - "What happened last Tuesday?"
    - Any question about past hands or sessions
  `,
  parameters: z.object({
    query: z.string()
      .describe("Natural language query or structured filters"),
    filters: z.object({
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      hero_hand: z.string().optional(),
      position: z.string().optional(),
      result_min: z.number().optional(),
      result_max: z.number().optional(),
    }).optional(),
    limit: z.number()
      .max(100)
      .default(10),
  }),
  handler: async (params) => {
    const db = await getDatabase();
    return db.query(params);
  },
};

// ─── Vision Tools ───

export const pokerAnalyzeScreenshot = {
  name: "poker_analyze_screenshot",
  description: `
    Analyze a screenshot of a poker table.
    Detects cards, positions, stacks, and game state.
    
    Use this when the user:
    - Uploads a screenshot
    - Asks about their current table
    - Wants real-time analysis
  `,
  parameters: z.object({
    image_data: z.string()
      .describe("Base64-encoded image data"),
    image_format: z.enum(["png", "jpg", "webp"])
      .default("png"),
    site: z.enum(["auto", "pokerstars", "ggpoker", "partypoker", "ignition"])
      .default("auto"),
  }),
  handler: async (params) => {
    const vision = await getVisionEngine();
    return vision.analyze(params);
  },
};

export const pokerConnectDesktop = {
  name: "poker_connect_desktop",
  description: `
    Connect to a desktop poker client for real-time monitoring.
    
    Use this when the user wants live coaching during a session.
  `,
  parameters: z.object({
    client: z.enum(["pokerstars", "ggpoker", "partypoker", "ignition"]),
    auto_detect: z.boolean().default(true),
  }),
  handler: async (params) => {
    const desktop = await getDesktopConnector();
    return desktop.connect(params);
  },
};

// ─── Training Tools ───

export const pokerStartDrill = {
  name: "poker_start_drill",
  description: `
    Start an interactive training drill.
    
    Use this when the user wants to practice:
    - Preflop ranges
    - Equity estimation
    - Pot odds calculation
    - Hand reading
  `,
  parameters: z.object({
    category: z.enum(["preflop", "postflop", "equity", "odds", "reads", "icm"]),
    difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"])
      .default("intermediate"),
    count: z.number()
      .max(50)
      .default(10),
  }),
  handler: async (params) => {
    const trainer = await getTrainer();
    return trainer.startDrill(params);
  },
};

export const pokerGetTrainingProgress = {
  name: "poker_get_training_progress",
  description: `
    Get user's training progress and statistics.
    
    Use this to show the user their improvement over time.
  `,
  parameters: z.object({}),
  handler: async () => {
    const trainer = await getTrainer();
    return trainer.getProgress();
  },
};

// ─── All Tools Export ───

export const allTools = [
  pokerCalculateEquity,
  pokerAnalyzeRange,
  pokerGetStrategy,
  pokerReviewHand,
  pokerQueryDatabase,
  pokerAnalyzeScreenshot,
  pokerConnectDesktop,
  pokerStartDrill,
  pokerGetTrainingProgress,
];
```

### 3.3 MCP Resource 定义

```typescript
// packages/@poker-suite/mcp-server/src/resources/index.ts

export const pokerResources = {
  // GTO 策略资源
  "strategy://preflop/{position}": {
    description: "GTO preflop strategy for a given position",
    parameters: {
      position: { type: "string", enum: ["UTG", "MP", "CO", "BTN", "SB", "BB"] },
      stack_depth: { type: "number", default: 100 },
      table_size: { type: "number", default: 6 },
    },
    handler: async (params) => {
      const db = await getStrategyDB();
      return db.getPreflopStrategy(params);
    },
  },

  "strategy://postflop/{board_texture}": {
    description: "GTO postflop strategy for a given board texture",
    parameters: {
      board_texture: { type: "string" },
      position: { type: "string" },
      action: { type: "string" },
    },
    handler: async (params) => {
      const db = await getStrategyDB();
      return db.getPostflopStrategy(params);
    },
  },

  // 手牌数据库资源
  "hand-db://{player}/{date}": {
    description: "Hand history database for a player on a specific date",
    parameters: {
      player: { type: "string" },
      date: { type: "string" },
    },
    handler: async (params) => {
      const db = await getDatabase();
      return db.getHands(params);
    },
  },

  // 玩家统计资源
  "player-stats://{player_name}": {
    description: "Statistics for a specific player",
    parameters: {
      player_name: { type: "string" },
      timeframe: { type: "string", default: "all" },
    },
    handler: async (params) => {
      const db = await getDatabase();
      return db.getPlayerStats(params);
    },
  },
};
```

### 3.4 MCP Prompt 定义

```typescript
// packages/@poker-suite/mcp-server/src/prompts/index.ts

export const pokerPrompts = {
  "poker_review_session": {
    description: "Generate a comprehensive session review",
    arguments: [
      { name: "session_id", description: "Session ID", required: true },
      { name: "focus", description: "Area to focus on", required: false },
    ],
    handler: async (args) => {
      return `
You are an expert poker coach reviewing a session. Analyze the following session
and provide actionable feedback.

Session: ${args.session_id}
Focus: ${args.focus || "overall"}

Please analyze:
1. Overall session performance (bb/100, win rate)
2. Key hands and decisions
3. Identified leaks or patterns
4. Specific recommendations for improvement
5. Mental game observations

Be constructive but honest. Use poker terminology appropriately.
`;
    },
  },

  "poker_explain_concept": {
    description: "Explain a poker concept in depth",
    arguments: [
      { name: "concept", description: "Concept to explain", required: true },
      { name: "level", description: "Explanation level", required: false },
    ],
    handler: async (args) => {
      return `
You are a poker educator explaining ${args.concept} to a ${args.level || "intermediate"} player.

Please provide:
1. Definition and core idea
2. Why it matters
3. Mathematical foundation (if applicable)
4. Practical examples
5. Common mistakes
6. How to practice

Make it engaging and easy to understand.
`;
    },
  },

  "poker_analyze_spot": {
    description: "Analyze a specific poker spot",
    arguments: [
      { name: "position", description: "Hero position", required: true },
      { name: "hand", description: "Hero hand", required: true },
      { name: "board", description: "Board cards", required: true },
      { name: "action", description: "Current action facing", required: true },
    ],
    handler: async (args) => {
      return `
Analyze this poker spot and provide GTO-aligned advice.

Spot:
- Position: ${args.position}
- Hand: ${args.hand}
- Board: ${args.board}
- Facing: ${args.action}

Please:
1. Calculate relevant equities and odds
2. Consider opponent range
3. Provide action recommendation
4. Explain reasoning
5. Mention any relevant GTO principles
`;
    },
  },
};
```

---

## 四、RAG 知识引擎

### 4.1 知识库架构

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG KNOWLEDGE ENGINE                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Document Ingestion Pipeline                         │   │
│  │                                                     │   │
│  │  Sources:                                           │   │
│  │  • GTO Strategy Books (PDF → text → chunks)        │   │
│  │  • Video Transcripts (YouTube → ASR → text)        │   │
│  │  • Forum Posts (2+2, Reddit → structured)          │   │
│  │  • Hand Analysis (Community submissions)           │   │
│  │  • Solver Outputs (Strategy files → text)          │   │
│  │  • User Notes (Personal strategy notes)            │   │
│  │                                                     │   │
│  │  Processing:                                        │   │
│  │  1. OCR / Text extraction                           │   │
│  │  2. Language detection                              │   │
│  │  3. Chunking (semantic / fixed / hybrid)           │   │
│  │  4. Embedding (text-embedding-3-large)             │   │
│  │  5. Metadata extraction (topic, position, stakes)  │   │
│  │  6. Quality scoring                                 │   │
│  │  7. Store in vector DB                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Vector Database                                     │   │
│  │                                                     │   │
│  │  Primary: ChromaDB (self-hosted)                    │   │
│  │  Cloud: Pinecone (managed)                          │   │
│  │  Enterprise: pgvector (PostgreSQL)                  │   │
│  │                                                     │   │
│  │  Collections:                                       │   │
│  │  • preflop_strategies                               │   │
│  │  • postflop_strategies                              │   │
│  │  • hand_analysis                                    │   │
│  │  • tournament_icm                                   │   │
│  │  • mental_game                                      │   │
│  │  • user_notes (private)                             │   │
│  │                                                     │   │
│  │  Index Structure:                                   │   │
│  │  • id: uuid                                         │   │
│  │  • embedding: 3072-dim vector                       │   │
│  │  • document: text content                           │   │
│  │  • metadata: {                                      │   │
│  │      source, topic, position,                       │   │
│  │      stakes, game_type, date,                       │   │
│  │      quality_score, author                          │   │
│  │    }                                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Retrieval Pipeline                                  │   │
│  │                                                     │   │
│  │  Input: User query (natural language)               │   │
│  │                                                     │   │
│  │  Step 1: Query Understanding                        │   │
│  │  • Intent classification                            │   │
│  │  • Entity extraction (position, hand, board)       │   │
│  │  • Context enrichment (user history, level)        │   │
│  │                                                     │   │
│  │  Step 2: Hybrid Retrieval                           │   │
│  │  • Semantic search (vector similarity)             │   │
│  │  • Keyword search (BM25)                           │   │
│  │  • Filter by metadata (position, stakes, etc.)     │   │
│  │                                                     │   │
│  │  Step 3: Reranking                                  │   │
│  │  • Cross-encoder reranker                           │   │
│  │  • Recency boost                                    │   │
│  │  • Source quality boost                             │   │
│  │                                                     │   │
│  │  Step 4: Context Assembly                           │   │
│  │  • Select top-K chunks (K=5-10)                    │   │
│  │  • Deduplicate                                      │   │
│  │  • Format for LLM                                   │   │
│  │                                                     │   │
│  │  Output: Context string for LLM                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Generation Pipeline                                 │   │
│  │                                                     │   │
│  │  Input: User query + Retrieved context              │   │
│  │                                                     │   │
│  │  LLM Prompt:                                        │   │
│  │  ```                                                │   │
│  │  You are an expert poker coach.                     │   │
│  │                                                     │   │
│  │  Context:                                           │   │
│  │  {retrieved_chunks}                                 │   │
│  │                                                     │   │
│  │  User question: {query}                             │   │
│  │                                                     │   │
│  │  Instructions:                                      │   │
│  │  1. Use the provided context                        │   │
│  │  2. If calculation is needed, call the appropriate  │   │
│  │     MCP tool                                        │   │
│  │  3. Cite sources when referencing specific strategies│   │
│  │  4. Be concise but thorough                         │   │
│  │  ```                                                │   │
│  │                                                     │   │
│  │  Output: Streaming response with citations          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 知识库内容组织

| 集合 | 内容 | 来源 | 更新频率 |
|:-----|:-----|:-----|:--------:|
| `preflop_strategies` | 翻前范围表、开局策略 | 社区贡献、Solver 输出 | 每周 |
| `postflop_strategies` | 翻后策略、下注尺寸 | 视频转录、书籍 | 每周 |
| `hand_analysis` | 手牌分析、讨论 | 论坛、社区提交 | 每日 |
| `tournament_icm` | 锦标赛策略、ICM 计算 | 专业内容 | 每月 |
| `mental_game` | 心理游戏、Tilt 控制 | 书籍、文章 | 每月 |
| `math_fundamentals` | 数学基础、概率 | 教材、论文 | 静态 |
| `user_notes` | 用户个人笔记 | 用户输入 | 实时 |

### 4.3 RAG 查询示例

```
用户: "我在 BTN 用 AKs 面对 CO 的 3bet，100BB 深度，应该怎么办？"

Query Understanding:
  • Intent: strategy_query
  • Entities: {position: BTN, hand: AKs, action: facing_3bet, 
               villain_position: CO, stack_depth: 100}

Retrieval:
  • Semantic: "BTN facing 3bet AKs strategy"
  • Filter: position=BTN, stakes=100BB, game_type=cash
  • Top results:
    1. "BTN vs CO 3bet: AKs is a standard 4bet or call"
    2. "100BB deep: 4bet sizing should be 22-25BB"
    3. "AKs equity vs typical CO 3bet range: 47.3%"

Tool Calls (by Agent):
  • poker_calculate_equity(hero="AsKh", villain=["JJ+", "AQs+", "KQs"])
  • poker_get_strategy(position="BTN", action="facing_3bet", stack_depth=100)

Response:
  "AKs on BTN facing a CO 3bet is a strong spot. Here's the analysis:
  
  **Math**: Your equity vs a typical CO 3bet range is ~47.3%.
  Pot odds require 33%, so both calling and 4betting are +EV.
  
  **GTO Strategy**: At 100BB, AKs is a mixed strategy:
  • 60% of the time: 4bet to 22-25BB
  • 40% of the time: Call and play postflop
  
  **Adjustment**: If CO is tight, lean toward calling. 
  If CO is aggressive, 4bet more.
  
  *Sources: [GTO Preflop Chart - BTN](#), [Solver Analysis: BTN vs CO 3bet](#)*"
```

---

## 五、多 Agent 角色体系

### 5.1 Agent 角色矩阵

| Agent | 角色 | 核心能力 | 使用场景 | 语音 |
|:------|:-----|:---------|:---------|:----:|
| **Poker Coach** | 实时教练 | 权益计算 + 策略查询 + 对手读牌 | 打牌时实时建议 | ✅ |
| **Hand Reviewer** | 复盘专家 | 手牌历史分析 + 漏洞识别 + 改进建议 | 打完牌后复盘 | ✅ |
| **Trainer** | 训练师 | 间隔重复 + 场景生成 + 进度追踪 | 日常练习 | ✅ |
| **Solver Guru** | 策略大师 | GTO 查询 + 博弈树分析 + 策略解释 | 学习 GTO | ❌ |
| **Bankroll Advisor** | 资金管理 | BRM + Kelly + ICM + 风险分析 | 资金管理 | ✅ |
| **Mental Coach** | 心理教练 | Tilt 检测 + 情绪管理 + 专注力 | 心理建设 | ✅ |

### 5.2 Poker Coach Agent（实时教练）

```typescript
// agent/coach/poker-coach.ts

interface PokerCoachConfig {
  voiceEnabled: boolean;
  verbosity: "minimal" | "standard" | "detailed";
  autoAnalyze: boolean;
  alertThreshold: "never" | "mistake" | "close" | "always";
  preferredFormat: "text" | "voice" | "both";
}

class PokerCoachAgent {
  private engine: PokerEngine;
  private memory: SessionMemory;
  private voice: VoiceInterface;
  private config: PokerCoachConfig;

  async onGameStateChange(state: GameState): Promise<CoachResponse> {
    // 1. 快速计算核心指标
    const equity = await this.engine.calculateEquity({
      hero: state.heroHand,
      villain: this.inferVillainRange(state),
      board: state.board,
    });

    const potOdds = state.toCall / (state.pot + state.toCall);
    const ev = equity.equity * state.pot - (1 - equity.equity) * state.toCall;

    // 2. 决策建议
    let recommendation: string;
    let confidence: number;

    if (ev > 0 && equity.equity > potOdds * 1.2) {
      recommendation = "Raise for value";
      confidence = 0.85;
    } else if (ev > 0) {
      recommendation = "Call";
      confidence = 0.7;
    } else {
      recommendation = "Fold";
      confidence = 0.9;
    }

    // 3. 生成自然语言回复
    const response = await this.generateResponse({
      state,
      equity,
      potOdds,
      ev,
      recommendation,
      confidence,
    });

    // 4. 语音输出（如果启用）
    if (this.config.voiceEnabled && this.config.preferredFormat !== "text") {
      await this.voice.speak(response.summary);
    }

    return {
      summary: response.summary,
      detailed: response.detailed,
      recommendation,
      confidence,
      equity: equity.equity,
      potOdds,
      ev,
      visualization: {
        type: "equity_bar",
        data: { equity: equity.equity, win: equity.win, tie: equity.tie },
      },
    };
  }

  private async generateResponse(context: CoachContext): Promise<CoachResponseText> {
    // 使用 LLM 生成自然语言回复
    // 但基于数学计算的结果，不是幻觉
    const prompt = `
You are a poker coach speaking to a player during a hand.

Game State:
- Hero: ${context.state.heroHand} in ${context.state.position}
- Board: ${context.state.board || "Pre-flop"}
- Pot: ${context.state.pot}BB
- To Call: ${context.state.toCall}BB
- Equity: ${(context.equity.equity * 100).toFixed(1)}%
- Pot Odds: ${(context.potOdds * 100).toFixed(1)}%
- EV: ${context.ev.toFixed(2)}BB

Recommendation: ${context.recommendation} (confidence: ${context.confidence})

Generate a concise coaching response:
1. One-sentence summary (for voice)
2. Brief explanation with key numbers
3. What to watch for on next street (if applicable)
`;

    return await this.llm.generate(prompt, { maxTokens: 200 });
  }

  private inferVillainRange(state: GameState): string[] {
    // 基于位置和对手历史推断范围
    // 使用记忆系统中的对手模型
    const opponent = this.memory.getOpponentModel(state.villainPosition);
    return opponent ? opponent.getRangeForAction(state.action) : ["random"];
  }
}
```

### 5.3 Hand Reviewer Agent（复盘专家）

```typescript
// agent/reviewer/hand-reviewer.ts

class HandReviewerAgent {
  async reviewHand(hand: HandHistory, depth: ReviewDepth): Promise<HandReview> {
    // 1. 解析手牌每个街的行动
    const streets = this.parseStreets(hand);

    // 2. 逐街分析
    const streetReviews: StreetReview[] = [];
    for (const street of streets) {
      const review = await this.analyzeStreet(street, hand);
      streetReviews.push(review);
    }

    // 3. 整体评估
    const overallRating = this.calculateOverallRating(streetReviews);

    // 4. 生成改进建议
    const lessons = await this.generateLessons(streetReviews, hand);

    // 5. 生成自然语言复盘
    const narrative = await this.generateNarrative(hand, streetReviews, lessons);

    return {
      handId: hand.id,
      overallRating,
      streetReviews,
      lessons,
      narrative,
      keyStats: this.calculateKeyStats(hand),
    };
  }

  private async analyzeStreet(street: Street, hand: HandHistory): Promise<StreetReview> {
    // 1. 计算当时的情境
    const equity = await this.engine.calculateEquity({
      hero: street.heroHand,
      villain: street.inferredVillainRange,
      board: street.board,
    });

    // 2. 获取 GTO 建议
    const gtoStrategy = await this.engine.getStrategy({
      position: hand.heroPosition,
      action: street.action,
      board: street.board,
    });

    // 3. 评估行动质量
    const actionQuality = this.evaluateAction(street.action, equity, gtoStrategy);

    // 4. 生成解释
    const explanation = await this.generateStreetExplanation(street, equity, actionQuality);

    return {
      street: street.name,
      action: street.action,
      actionQuality,
      equity: equity.equity,
      potOdds: street.potOdds,
      gtoStrategy,
      explanation,
      alternatives: this.generateAlternatives(street, equity, gtoStrategy),
    };
  }

  private async generateNarrative(
    hand: HandHistory,
    reviews: StreetReview[],
    lessons: string[]
  ): Promise<string> {
    const prompt = `
You are a poker coach reviewing a hand with a student.

Hand: ${hand.heroHand} from ${hand.heroPosition}
Result: ${hand.result > 0 ? "Won" : "Lost"} ${Math.abs(hand.result)}BB

Street-by-street analysis:
${reviews.map(r => `
${r.street}: ${r.action} — ${r.actionQuality}
${r.explanation}
`).join("
")}

Key lessons:
${lessons.map((l, i) => `${i + 1}. ${l}`).join("
")}

Write an engaging hand review in a conversational tone.
Include the story arc, key decision points, and what the player can learn.
Keep it under 500 words.
`;

    return await this.llm.generate(prompt, { maxTokens: 1000 });
  }
}
```

### 5.4 Trainer Agent（训练师）

```typescript
// agent/trainer/trainer.ts

class TrainerAgent {
  private fsrs: FSRS; // Free Spaced Repetition Scheduler

  async generateDrill(user: UserProfile, config: DrillConfig): Promise<Drill> {
    // 1. 分析用户弱点
    const weaknesses = this.identifyWeaknesses(user);

    // 2. 选择训练主题
    const topic = this.selectTopic(weaknesses, config);

    // 3. 生成场景
    const scenario = await this.generateScenario(topic, user.level);

    // 4. 创建训练题
    const questions = await this.generateQuestions(scenario);

    return {
      id: generateId(),
      topic,
      scenario,
      questions,
      difficulty: this.calculateDifficulty(user, topic),
    };
  }

  async evaluateAnswer(
    user: UserProfile,
    drill: Drill,
    question: Question,
    answer: Answer,
    timeMs: number
  ): Promise<EvaluationResult> {
    // 1. 判断对错
    const isCorrect = this.checkAnswer(question, answer);

    // 2. 计算评分
    const score = this.calculateScore(question, answer, timeMs);

    // 3. 更新 FSRS
    const card = user.getCard(drill.topic);
    const reviewResult = this.fsrs.review(card, isCorrect ? Rating.Good : Rating.Again);

    // 4. 生成反馈
    const feedback = await this.generateFeedback(question, answer, isCorrect);

    // 5. 更新用户档案
    user.updateProgress(drill.topic, score, reviewResult);

    return {
      isCorrect,
      score,
      feedback,
      nextReview: reviewResult.nextReview,
      stats: user.getStats(),
    };
  }

  private async generateScenario(topic: string, level: string): Promise<Scenario> {
    // 基于主题和水平生成真实场景
    const prompt = `
Generate a realistic poker training scenario for a ${level} player.
Topic: ${topic}

Include:
1. A specific spot (position, hand, board, action)
2. Relevant context (stack depth, opponent type, table dynamics)
3. The decision the player needs to make
4. Multiple choice options with one correct answer
`;

    return await this.llm.generate(prompt, { maxTokens: 500 });
  }
}
```

---

## 六、多模态输入系统

### 6.1 视觉识别架构

```
┌─────────────────────────────────────────────────────────────┐
│                  VISION INPUT PIPELINE                      │
│                                                             │
│  Input: Screenshot / Camera / Video Stream                  │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage 1: Site Detection                             │   │
│  │  • Template matching for known clients               │   │
│  │  • OCR of window title / table name                  │   │
│  │  • UI element detection (buttons, cards, chips)      │   │
│  │  Output: site_type, table_region                     │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage 2: Card Recognition                           │   │
│  │  • Template matching for card faces (52 templates)   │   │
│  │  • OCR backup for card text                          │   │
│  │  • Suit detection (color + symbol)                   │   │
│  │  Output: hero_cards[2], board_cards[3-5]             │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage 3: Number Extraction                          │   │
│  │  • OCR for stack sizes                               │   │
│  │  • OCR for pot size                                  │   │
│  │  • OCR for bet sizes                                 │   │
│  │  Output: stacks[], pot, current_bet                  │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage 4: Position Detection                         │   │
│  │  • Seat position relative to button                  │   │
│  │  • Button location detection                         │   │
│  │  • Active player highlight                           │   │
│  │  Output: hero_position, button_position              │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage 5: Action Detection                           │   │
│  │  • Detect whose turn it is                           │   │
│  │  • Read action buttons (Fold/Check/Call/Bet/Raise)   │   │
│  │  • Detect timer (if present)                         │   │
│  │  Output: action_required, time_remaining             │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage 6: Game State Reconstruction                  │   │
│  │  • Assemble all detected information                 │   │
│  │  • Validate consistency (e.g., 5 board cards max)   │   │
│  │  • Fill gaps with inference                          │   │
│  │  Output: GameState object                            │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage 7: Confidence Scoring                         │   │
│  │  • Calculate confidence for each detection           │   │
│  │  • Flag uncertain values                             │   │
│  │  • Request user confirmation if needed               │   │
│  │  Output: GameState + Confidence + Flags              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 支持的扑克客户端

| 客户端 | 支持级别 | 检测方式 | 备注 |
|:-------|:--------:|:---------|:-----|
| **PokerStars** | ✅ 完整 | 模板 + OCR | 最流行，优先支持 |
| **GG Poker** | ✅ 完整 | 模板 + OCR | 亚洲市场主流 |
| **PartyPoker** | ✅ 完整 | 模板 + OCR | 欧洲主流 |
| **888poker** | ⚠️ 部分 | OCR 为主 | 格式多变 |
| **Ignition** | ⚠️ 部分 | OCR 为主 | 匿名桌挑战 |
| **ACR** | ⚠️ 部分 | OCR 为主 | — |
| **通用** | ⚠️ 基础 | 纯 OCR | 任何客户端 |

### 6.3 语音交互系统

```
┌─────────────────────────────────────────────────────────────┐
│                   VOICE INTERACTION                         │
│                                                             │
│  Input: Voice (User speaks)                                 │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Speech Recognition                                  │   │
│  │  • Whisper v3 (本地)                                 │   │
│  │  • 支持多语言 (en/zh/es/ja/...)                      │   │
│  │  • 实时流式识别 (< 200ms latency)                    │   │
│  │  • 扑克术语词典增强                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  NLU (Natural Language Understanding)                │   │
│  │  • 意图识别: calculate_equity, ask_strategy, review  │   │
│  │  • 实体提取: hand, position, board, range            │   │
│  │  • 槽位填充: 补全缺失信息                            │   │
│  │  • 消歧: "AK" → "AsKh" or "AdKc"?                  │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Agent Processing                                    │   │
│  │  • 路由到对应 Agent (Coach / Reviewer / Trainer)    │   │
│  │  • 调用 MCP Tools                                    │   │
│  │  • 生成回复                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Text-to-Speech                                      │   │
│  │  • Coqui TTS / Piper (本地)                          │   │
│  │  • 多语言声音                                        │   │
│  │  • 语速/语调控制                                     │   │
│  │  • 扑克术语发音优化                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  Output: Voice (User hears)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 语音交互示例

```
用户: "我在大盲位有口袋对十，翻牌来了A-K-5彩虹面，
      前面的人都过牌了，我应该怎么办？"

语音识别 → NLU:
  意图: ask_strategy
  实体:
    position: BB
    hand: TT
    board: AsKh5c
    action: checked_to

Agent 处理:
  1. poker_calculate_equity(hero="TT", villain=["random"], board="AsKh5c")
     → equity: 0.42
  2. poker_get_strategy(position="BB", action="checked_to", board="AsKh5c")
     → strategy: check 70%, bet 30%

语音回复:
  "在这个翻牌面上，你的口袋对十处于一个比较尴尬的位置。
   虽然你有一个中对，但A和K都在牌面上。
   你的权益大约是42%。
   由于前面的人都过牌了，GTO 策略建议你70%的时间过牌，
   30%的时间做一个小注来测试对手。
   如果对手有A或K，他们可能会跟注或加注。
   考虑到这个牌面比较干燥，过牌控制底池是更安全的选择。"
```

---

## 七、实时分析引擎

### 7.1 实时架构

```
┌─────────────────────────────────────────────────────────────┐
│                  REAL-TIME ANALYSIS ENGINE                  │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐│
│  │   Input      │────→│   Pipeline   │────→│   Output     ││
│  │  Sources     │     │  (Stream)    │     │  Channels    ││
│  └──────────────┘     └──────────────┘     └──────────────┘│
│                                                             │
│  Input Sources:                    Pipeline:                │
│  • Desktop API (screen capture)    1. Frame extraction      │
│  • Vision AI (screenshot OCR)      2. State detection       │
│  • Manual input (user types)       3. Equity calculation    │
│  • Poker client API (if available) 4. Strategy lookup       │
│                                    5. Recommendation gen    │
│  Output Channels:                                           │
│  • WebSocket (web overlay)                                  │
│  • Voice (audio coaching)                                   │
│  • Visual (HUD overlay)                                     │
│  • Text (chat message)                                      │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 延迟优化

| 阶段 | 目标延迟 | 优化策略 |
|:-----|:--------:|:---------|
| Frame capture | < 50ms | 增量捕获，只捕获变化区域 |
| OCR/Detection | < 100ms | 模型量化，GPU 加速 |
| Equity calc | < 50ms | 预计算缓存，快速路径 |
| Strategy lookup | < 20ms | In-memory cache |
| Response gen | < 200ms | 流式生成，预加载模板 |
| **Total** | **< 500ms** | 并行管道 |

### 7.3 实时 HUD

```typescript
interface RealTimeHUD {
  // 显示在扑克客户端上的叠加层
  overlay: {
    // 权益显示
    equity: {
      value: number;        // 47.3%
      position: "top-right";
      style: "large_number";
    };
    
    // 赔率显示
    potOdds: {
      value: number;        // 33.3%
      position: "top-right";
      style: "percentage";
    };
    
    // 建议行动
    recommendation: {
      action: "call" | "raise" | "fold";
      size?: number;        // 2.5x
      confidence: number;   // 0.85
      position: "bottom-center";
    };
    
    // 对手统计
    opponentStats: {
      position: "left";
      stats: {
        vpip: number;       // 28%
        pfr: number;        // 22%
        aggression: number; // 2.1
        hands: number;      // 156
      };
    };
    
    // 范围可视化
    rangeVisualizer: {
      position: "bottom-left";
      heroRange: RangeMatrix;
      villainRange: RangeMatrix;
    };
  };
}
```

---

## 八、Replay 系统

### 8.1 回放架构

```
┌─────────────────────────────────────────────────────────────┐
│                    REPLAY SYSTEM                            │
│                                                             │
│  Input: Hand History                                        │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Timeline Construction                            │   │
│  │  • Parse hand history into events                    │   │
│  │  • Create timeline with timestamps                   │   │
│  │  • Identify decision points                          │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2. AI Commentary Generation                         │   │
│  │  • Pre-flop: "Hero opens with AKs from BTN..."     │   │
│  │  • Flop: "The flop comes T-9-2 rainbow..."           │   │
│  │  • Analysis: "Hero has top pair top kicker..."       │   │
│  │  • Recommendation: "The standard play is a cbet..."  │   │
│  │  • Post-hand: "In hindsight, the river bluff was..." │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3. Interactive Player                               │   │
│  │  • Play/Pause/Rewind                                 │   │
│  │  • Speed control (0.5x - 3x)                         │   │
│  │  • Jump to decision points                           │   │
│  │  • Show/Hide AI commentary                           │   │
│  │  • User prediction mode ("What would you do?")       │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  4. Social Features                                  │   │
│  │  • Share replay link                                 │   │
│  │  • Embed in forum posts                              │   │
│  │  • Comment on specific spots                         │   │
│  │  • Vote on best line                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 回放格式

```json
{
  "version": "2028.1",
  "hand": {
    "id": "hh-2028-06-17-001",
    "site": "pokerstars",
    "timestamp": "2028-06-17T14:30:00Z",
    "game_type": "NL Hold'em",
    "stakes": "0.50/1.00",
    "table_size": 6
  },
  "timeline": [
    {
      "time": 0,
      "event": "preflop_deal",
      "data": {
        "hero_hand": ["As", "Kh"],
        "hero_position": "BTN",
        "blinds": [0.50, 1.00]
      },
      "commentary": "Hero is dealt Ace-King suited on the button."
    },
    {
      "time": 2.5,
      "event": "preflop_action",
      "data": {
        "player": "Hero",
        "action": "raise",
        "amount": 2.5
      },
      "commentary": "Hero opens to 2.5BB, a standard raise from the button."
    },
    {
      "time": 5.0,
      "event": "preflop_action",
      "data": {
        "player": "BB",
        "action": "3bet",
        "amount": 10
      },
      "commentary": "The big blind 3-bets to 10BB. Against a typical BB 3-bet range, AKs has 47.3% equity."
    },
    {
      "time": 8.0,
      "event": "decision_point",
      "data": {
        "player": "Hero",
        "options": ["fold", "call", "4bet"],
        "gto_strategy": {
          "fold": 0.05,
          "call": 0.35,
          "4bet": 0.60
        }
      },
      "commentary": "Hero faces a decision. GTO suggests folding 5%, calling 35%, and 4-betting 60% of the time."
    },
    {
      "time": 12.0,
      "event": "preflop_action",
      "data": {
        "player": "Hero",
        "action": "4bet",
        "amount": 25
      },
      "commentary": "Hero 4-bets to 25BB. This is the GTO play 60% of the time."
    }
  ],
  "ai_review": {
    "overall_rating": "good",
    "key_lessons": [
      "AKs is a standard 4-bet against a BB 3-bet at 100BB deep",
      "The 4-bet sizing of 25BB is appropriate"
    ]
  }
}
```

---

## 九、Agent 编排与记忆

### 9.1 编排架构

```
┌─────────────────────────────────────────────────────────────┐
│                 AGENT ORCHESTRATION                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Master Agent (Orchestrator)                         │   │
│  │  • Receives all user input                           │   │
│  │  • Determines intent and routes to sub-agent         │   │
│  │  • Manages conversation context                      │   │
│  │  • Coordinates multi-agent workflows                 │   │
│  └─────────────────────────────────────────────────────┘   │
│     │                                                       │
│     ├─── PokerCoachAgent ───┐                               │
│     ├─── HandReviewerAgent ─┤                               │
│     ├─── TrainerAgent ──────┤─── Tool Calls ──── Engine     │
│     ├─── SolverGuruAgent ───┤                               │
│     ├─── BankrollAgent ─────┤                               │
│     └─── MentalCoachAgent ──┘                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Shared Memory (All agents can access)               │   │
│  │  • Current game state                                │   │
│  │  • User profile and preferences                      │   │
│  │  • Session history                                   │   │
│  │  • Opponent models                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 记忆系统

```typescript
interface MemorySystem {
  // 短期记忆（会话级）
  shortTerm: {
    currentHand: HandState | null;
    currentConversation: Message[];
    recentDecisions: Decision[];
  };

  // 工作记忆（近期）
  working: {
    sessionStats: SessionStats;
    opponentModels: Map<string, OpponentModel>;
    tableDynamics: TableDynamics;
  };

  // 长期记忆（持久化）
  longTerm: {
    userProfile: UserProfile;
    historicalStats: PlayerStats;
    learnedPreferences: UserPreferences;
    studyProgress: Map<string, StudyProgress>;
  };
}

// 对手模型
interface OpponentModel {
  playerId: string;
  observations: {
    hands: number;
    vpip: number;
    pfr: number;
    aggression: number;
    showdownWon: number;
    showdownSeen: number;
  };
  tendencies: {
    preflop: { openRange: string; 3betRange: string };
    postflop: { cbetFreq: number; foldToCbet: number };
  };
  notes: string[];
  lastUpdated: Date;
}
```

---

## 十、安全与合规

### 10.1 反作弊设计

| 层面 | 措施 |
|:-----|:-----|
| **定位** | 明确"学习工具"而非"作弊工具" |
| **使用场景** | 仅用于复盘和学习，不用于实时游戏辅助 |
| **数据隐私** | 用户手牌不上传，本地处理优先 |
| **公平性** | 所有功能对所有人开放，不针对特定平台 |
| **透明度** | 开源代码，可审计 |

### 10.2 合规清单

- [ ] GDPR 合规（欧盟用户）
- [ ] CCPA 合规（加州用户）
- [ ] 年龄验证（18+）
- [ ] 赌博免责声明
- [ ] 开源许可证（MIT）
- [ ] 第三方服务 ToS 遵守

### 10.3 用户协议要点

```
1. Poker Suite 仅供学习和娱乐使用
2. 用户不得将实时辅助功能用于在线扑克游戏
3. 用户应对自己的决策负责
4. 本工具不保证盈利结果
5. 请遵守当地法律和扑克平台规则
```

---

> **文档结束**。本设计为 2028 年 Agent 时代的扑克智能平台提供了完整的架构蓝图，
> 核心原则是"AI Agent 可以直接调用整个 Poker Engine"。
> 通过 MCP 协议、多模态输入、实时分析和智能编排，
> 打造真正的 Agent-Native 扑克智能平台。
