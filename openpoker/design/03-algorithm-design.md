# Poker Suite — 算法体系设计文档 (v1.0)

> **设计日期**: 2026-06-17
> **设计范围**: 从零构建德州扑克全算法栈
> **设计目标**: Hand Evaluator · Monte Carlo · Exact Equity · Range vs Range · Nash Equilibrium · CFR · CFR+ · MCCFR · ICM · Tournament · Multiway · Side Pot

---

## 目录

1. [Hand Evaluator](#1-hand-evaluator)
2. [Monte Carlo Equity](#2-monte-carlo-equity)
3. [Exact Equity](#3-exact-equity)
4. [Range vs Range](#4-range-vs-range)
5. [Nash Equilibrium](#5-nash-equilibrium)
6. [CFR (Counterfactual Regret Minimization)](#6-cfr)
7. [CFR+](#7-cfr)
8. [MCCFR (Monte Carlo CFR)](#8-mccfr)
9. [ICM (Independent Chip Model)](#9-icm)
10. [Tournament Mathematics](#10-tournament-mathematics)
11. [Multiway Equity](#11-multiway-equity)
12. [Side Pot Calculation](#12-side-pot-calculation)
13. [复杂度与性能分析](#13-复杂度与性能分析)
14. [优化方向](#14-优化方向)
15. [未来升级路线](#15-未来升级路线)

---

## 1. Hand Evaluator

### 1.1 问题定义

输入：5 至 7 张扑克牌  
输出：该牌型的绝对排名（0–7462，7462 为皇家同花顺），以及牌型类别（高牌、一对、两对…皇家同花顺）

核心要求：
- 单次 5 牌评估 < 10ns
- 7 牌评估（枚举 C(7,5)=21 种 5 牌组合）< 200ns
- WASM 环境下编译体积 < 300KB
- 零堆分配（WASM GC 友好）

### 1.2 算法方案对比

| 算法 | 原理 | 5牌评估 | 7牌评估 | 内存占用 | WASM体积 | 适用场景 |
|------|------|:-------:|:-------:|:--------:|:--------:|:---------|
| **Straightforward** | 排序 + 规则匹配 | ~500ns | ~10μs | 0 | 0 | 教学/原型 |
| **Cactus Kev's** | 素数积编码 + 查找表 | ~50ns | ~1μs | ~20MB | ~20MB | 历史参考 |
| **Two Plus Two** | 链式指针查找表 | ~5ns | ~100ns | ~130MB | ~130MB | 桌面原生应用 |
| **Perfect Hash (Henry Lee)** | 完美哈希 + DP | ~3ns | ~60ns | ~100KB | ~100KB | **现代首选** |
| **PH7 (扩展)** | 7牌完美哈希 | ~10ns | ~10ns | ~50MB | ~50MB | 极致性能 |

### 1.3 设计选择：Perfect Hash 5-Card + 7-Card Enum

**原因**：
- 100KB WASM 体积完美匹配 Web 场景
- 3ns/5牌 在 Rust 中实测可达
- 7 牌通过枚举 21 个 5 牌组合，每个 3ns，总计 ~63ns + 开销 ≈ 100-200ns
- 可通过 SIMD 批量评估 4/8/16 组 7 牌同时降至 ~50ns/组

### 1.4 核心数据结构

```rust
// ─── 牌表示 ───
pub const DECK_SIZE: usize = 52;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct Card(pub u8); // 0-51, 低6位: rank(0-12), 高2位: suit(0-3)

impl Card {
    #[inline(always)]
    pub fn rank(&self) -> u8 { self.0 & 0x0F }
    
    #[inline(always)]
    pub fn suit(&self) -> u8 { self.0 >> 4 }
    
    #[inline(always)]
    pub fn from_rank_suit(rank: u8, suit: u8) -> Self {
        Card((suit << 4) | rank)
    }
}

// ─── 牌型排名 ───
// 0-7462 线性排名，越大越强
// 可直接比较: rank_a > rank_b 表示 a 赢
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct HandRank(pub u16);

impl HandRank {
    #[inline(always)]
    pub fn category(&self) -> HandCategory {
        match self.0 {
            0..=1276 => HandCategory::HighCard,
            1277..=4136 => HandCategory::OnePair,
            4137..=4994 => HandCategory::TwoPair,
            4995..=5852 => HandCategory::ThreeOfAKind,
            5853..=5862 => HandCategory::Straight,
            5863..=7139 => HandCategory::Flush,
            7140..=7295 => HandCategory::FullHouse,
            7296..=7452 => HandCategory::FourOfAKind,
            7453..=7461 => HandCategory::StraightFlush,
            7462 => HandCategory::RoyalFlush,
            _ => unreachable!(),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HandCategory {
    HighCard = 0, OnePair, TwoPair, ThreeOfAKind,
    Straight, Flush, FullHouse, FourOfAKind, StraightFlush, RoyalFlush,
}

// ─── 评估器接口 ───
pub trait Evaluator: Send + Sync {
    /// 评估5张牌，返回绝对排名
    fn eval5(&self, cards: [Card; 5]) -> HandRank;
    
    /// 评估7张牌，返回最佳5张组合的排名
    fn eval7(&self, cards: [Card; 7]) -> HandRank;
    
    /// 批量评估（SIMD优化路径）
    fn eval7_batch(&self, hands: &[[Card; 7]]) -> Vec<HandRank>;
    
    /// 比较两手牌，返回 Ordering
    fn compare(&self, a: HandRank, b: HandRank) -> Ordering {
        a.cmp(&b)
    }
}
```

### 1.5 Perfect Hash 实现细节

#### 1.5.1 5-Card Perfect Hash

```rust
pub struct PerfectHashEvaluator {
    // 完美哈希查找表
    // 大小: 约 100KB
    // 使用 lazy_static 或 const 编译时生成
    lookup_table: &'static [u16; PH_TABLE_SIZE],
    flush_table: &'static [u16; FLUSH_TABLE_SIZE],
}

impl PerfectHashEvaluator {
    /// 核心评估逻辑
    #[inline(always)]
    pub fn eval5_fast(&self, cards: [Card; 5]) -> HandRank {
        // Step 1: 检查同花
        let suit_mask = cards[0].suit() == cards[1].suit()
            && cards[1].suit() == cards[2].suit()
            && cards[2].suit() == cards[3].suit()
            && cards[3].suit() == cards[4].suit();
        
        if suit_mask {
            // 同花：用 flush_table 查找
            let index = self.flush_index(&cards);
            HandRank(self.flush_table[index])
        } else {
            // 非同花：用 unique hash
            let index = self.unique_hash(&cards);
            HandRank(self.lookup_table[index])
        }
    }
    
    /// 7牌评估：枚举 C(7,5)=21 种组合
    #[inline]
    pub fn eval7(&self, cards: [Card; 7]) -> HandRank {
        let mut best = HandRank(0);
        
        // 使用预计算的枚举索引，避免运行时组合生成
        const COMBO5: [[usize; 5]; 21] = [
            [0,1,2,3,4], [0,1,2,3,5], [0,1,2,3,6],
            [0,1,2,4,5], [0,1,2,4,6], [0,1,2,5,6],
            [0,1,3,4,5], [0,1,3,4,6], [0,1,3,5,6],
            [0,1,4,5,6], [0,2,3,4,5], [0,2,3,4,6],
            [0,2,3,5,6], [0,2,4,5,6], [0,3,4,5,6],
            [1,2,3,4,5], [1,2,3,4,6], [1,2,3,5,6],
            [1,2,4,5,6], [1,3,4,5,6], [2,3,4,5,6],
        ];
        
        for combo in COMBO5.iter() {
            let hand = [
                cards[combo[0]], cards[combo[1]], cards[combo[2]],
                cards[combo[3]], cards[combo[4]],
            ];
            let rank = self.eval5_fast(hand);
            if rank > best {
                best = rank;
            }
        }
        
        best
    }
}
```

#### 1.5.2 7-Card Direct Lookup (可选优化)

对于极致性能场景，可预计算 7 牌直接查找表：

- 7 牌组合数: C(52,7) = 133,784,560
- 用 27-bit 索引（133M < 2^27）
- 表大小: 133M × 2 bytes = ~267MB
- WASM 中不可行，但桌面原生可用
- 实现: 首次运行时本地生成并缓存

#### 1.5.3 SIMD 批量评估

```rust
#[cfg(target_arch = "x86_64")]
pub struct SimdEvaluator {
    base: PerfectHashEvaluator,
}

#[cfg(target_arch = "x86_64")]
impl SimdEvaluator {
    /// 使用 AVX2 批量评估 8 组 7 牌
    /// 预期性能: ~400ns / 8 hands = 50ns/hand
    #[target_feature(enable = "avx2")]
    pub unsafe fn eval7_batch_avx2(&self, hands: &[[Card; 7]]) -> Vec<HandRank> {
        use std::arch::x86_64::*;
        
        let mut results = Vec::with_capacity(hands.len());
        
        // 每次处理 8 手牌
        for chunk in hands.chunks(8) {
            // 将 8 组 7 牌加载到 SIMD 寄存器
            // 对每组枚举 21 个 5 牌组合
            // 使用 SIMD 并行比较找出每组的最大值
            
            // 伪代码示意：
            // let mut max_ranks = _mm256_set1_epi16(0);
            // for combo in COMBO5.iter() {
            //     let ranks = self.eval5_simd8(chunk, combo);
            //     max_ranks = _mm256_max_epi16(max_ranks, ranks);
            // }
            // 提取结果
        }
        
        results
    }
}
```

### 1.6 WASM 适配

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmEvaluator {
    inner: PerfectHashEvaluator,
}

#[wasm_bindgen]
impl WasmEvaluator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self { inner: PerfectHashEvaluator::new() }
    }
    
    /// 输入: 7 个 u8 牌值 (0-51)
    /// 输出: u16 排名
    #[wasm_bindgen(js_name = eval7)]
    pub fn eval7_js(&self, cards: &[u8]) -> u16 {
        assert_eq!(cards.len(), 7);
        let hand: [Card; 7] = [
            Card(cards[0]), Card(cards[1]), Card(cards[2]),
            Card(cards[3]), Card(cards[4]), Card(cards[5]), Card(cards[6]),
        ];
        self.inner.eval7(hand).0
    }
    
    /// 批量评估（避免 JS 调用开销）
    #[wasm_bindgen(js_name = eval7Batch)]
    pub fn eval7_batch_js(&self, cards: &[u8]) -> Vec<u16> {
        // cards 是扁平数组: [c0_0, c0_1, ..., c0_6, c1_0, ..., cN_6]
        assert_eq!(cards.len() % 7, 0);
        let num_hands = cards.len() / 7;
        let mut results = Vec::with_capacity(num_hands);
        
        for i in 0..num_hands {
            let offset = i * 7;
            let hand: [Card; 7] = [
                Card(cards[offset]), Card(cards[offset+1]), Card(cards[offset+2]),
                Card(cards[offset+3]), Card(cards[offset+4]), Card(cards[offset+5]),
                Card(cards[offset+6]),
            ];
            results.push(self.inner.eval7(hand).0);
        }
        
        results
    }
}
```

### 1.7 性能基准（目标）

| 场景 | 单线程 | SIMD (AVX2) | WASM (单线程) |
|------|:------:|:-----------:|:-------------:|
| 5 牌评估 | 3ns | 3ns | 5-8ns |
| 7 牌评估 | 150ns | 50ns | 300-500ns |
| 100 万 7 牌 | 150ms | 50ms | 300-500ms |

---

## 2. Monte Carlo Equity

### 2.1 问题定义

输入：
- Hero hand: 2 张牌
- Villain ranges: N 个范围（每个范围是一组加权手牌组合）
- Board: 0-5 张公共牌
- Dead cards: 已知的死牌

输出：
- Hero 的胜率 (Equity)：0.0–1.0
- Win / Tie / Loss 概率分解
- 对每个 villain 的单独胜率

### 2.2 算法核心

```
┌─────────────────────────────────────────────────────────────┐
│              Monte Carlo Equity Algorithm                   │
│                                                             │
│  1. 从剩余牌堆中移除已知牌                                  │
│     deck = 52 cards - hero - board - dead - villain_cards   │
│                                                             │
│  2. 对每个 villain，从其范围中均匀采样一手牌                │
│     如果采样到冲突的手牌（与已采样牌或 board 重复），重采样 │
│                                                             │
│  3. 从剩余牌堆中随机发出剩余公共牌                          │
│     remaining = 5 - board.len()                             │
│     发 remaining 张牌补齐 board                             │
│                                                             │
│  4. 评估所有玩家的最佳 5 牌组合                             │
│     用 Hand Evaluator 评估每个玩家的 7 牌                   │
│                                                             │
│  5. 比较排名，确定胜负关系                                  │
│     最高排名者赢，同排名者平                                │
│                                                             │
│  6. 重复步骤 2-5，累计统计                                  │
│     wins, ties, losses += 1                                 │
│                                                             │
│  7. 返回 Equity = (wins + ties/2) / total_iterations        │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 核心数据结构

```rust
/// 蒙特卡洛配置
#[derive(Clone, Debug)]
pub struct MonteCarloConfig {
    /// 模拟次数
    pub iterations: u32,
    /// 收敛精度（可选，达到后提前终止）
    pub target_precision: Option<f64>,
    /// 超时时间 (ms)
    pub timeout_ms: u64,
    /// 线程数 (0 = 自动检测)
    pub threads: u32,
    /// 随机数生成器种子
    pub seed: Option<u64>,
    /// 是否使用 SIMD 批量评估
    pub use_simd: bool,
    /// 批次大小（每批评估多少组 matchup）
    pub batch_size: usize,
}

impl Default for MonteCarloConfig {
    fn default() -> Self {
        Self {
            iterations: 100_000,
            target_precision: Some(0.001), // 0.1%
            timeout_ms: 30_000,
            threads: 0, // 自动
            seed: None,
            use_simd: true,
            batch_size: 1024,
        }
    }
}

/// 单次模拟结果
#[derive(Clone, Debug, Default)]
pub struct TrialResult {
    pub hero_won: bool,
    pub hero_tied: bool,
    pub hero_rank: u16,
    pub villain_ranks: Vec<u16>,
}

/// 权益计算结果
#[derive(Clone, Debug)]
pub struct EquityResult {
    pub equity: f64,           // (wins + ties/2) / total
    pub win_probability: f64,
    pub tie_probability: f64,
    pub loss_probability: f64,
    pub total_iterations: u32,
    pub elapsed_ms: u64,
    pub convergence: f64,      // 95% CI half-width
    /// 每个 villain 的单独胜率
    pub vs_villains: Vec<VillainResult>,
}

#[derive(Clone, Debug)]
pub struct VillainResult {
    pub villain_index: usize,
    pub equity_vs: f64,
    pub win_vs: f64,
    pub tie_vs: f64,
}

/// Monte Carlo 计算器
pub struct MonteCarloCalculator<E: Evaluator> {
    evaluator: E,
    rng: ThreadRng, // 每个线程一个
}

impl<E: Evaluator> MonteCarloCalculator<E> {
    /// 主入口：计算多人底池权益
    pub fn calculate(
        &mut self,
        hero: [Card; 2],
        villains: Vec<VillainRange>,
        board: &[Card],
        dead: &[Card],
        config: &MonteCarloConfig,
    ) -> EquityResult {
        // 实现见下方
    }
}
```

### 2.4 洗牌与采样算法

#### 2.4.1 Fisher-Yates Shuffle (单次模拟)

```rust
/// 高效发牌：不需要完全洗牌，只需从剩余牌中随机抽取
#[inline(always)]
fn deal_remaining(
    deck: &mut [Card; 52],
    deck_size: usize,
    board: &[Card],
    count: usize,
    rng: &mut impl Rng,
) -> [Card; 5] {
    let mut result = [Card(0); 5];
    let board_len = board.len();
    
    // 将 board 复制到结果
    for i in 0..board_len {
        result[i] = board[i];
    }
    
    // 从剩余牌中随机抽取
    let mut available = deck_size;
    for i in board_len..(board_len + count) {
        let idx = rng.gen_range(0..available);
        result[i] = deck[idx];
        // 交换到尾部并缩小范围（Fisher-Yates 变体）
        available -= 1;
        deck.swap(idx, available);
    }
    
    result
}
```

#### 2.4.2 范围采样

```rust
/// 从范围中均匀采样一手牌
/// 范围表示为 [(Card, Card)] 列表（已去重和有效性验证）
#[inline]
fn sample_from_range(
    range: &[(Card, Card)],
    used_cards: &[Card],
    rng: &mut impl Rng,
) -> Option<[Card; 2]> {
    // 过滤掉与已用牌冲突的组合
    let valid: Vec<&(Card, Card)> = range.iter()
        .filter(|(a, b)| {
            !used_cards.contains(a) && !used_cards.contains(b)
        })
        .collect();
    
    if valid.is_empty() {
        return None;
    }
    
    let idx = rng.gen_range(0..valid.len());
    let (a, b) = valid[idx];
    Some([*a, *b])
}
```

### 2.5 批量评估优化 (SIMD)

```rust
/// 一批模拟的评估
/// 将 batch_size 组 7 牌打包，用 SIMD 同时评估
#[cfg(target_arch = "x86_64")]
#[target_feature(enable = "avx2")]
unsafe fn evaluate_batch_simd(
    &self,
    hands: &[[Card; 7]],
    results: &mut [HandRank],
) {
    // AVX2: 256-bit = 16 × u16
    // 一次可处理 16 组 7 牌的比较
    
    const CHUNK: usize = 16;
    
    for (chunk_idx, chunk) in hands.chunks(CHUNK).enumerate() {
        let mut ranks = [0u16; CHUNK];
        
        // 对 chunk 中的每组枚举 21 个 5 牌组合
        // 使用 SIMD 并行比较
        for combo in COMBO5.iter() {
            // 提取 16 组 5 牌
            let mut five_cards = [[Card(0); 5]; CHUNK];
            for (i, hand) in chunk.iter().enumerate() {
                for j in 0..5 {
                    five_cards[i][j] = hand[combo[j]];
                }
            }
            
            // SIMD 评估这 16 组 5 牌
            let combo_ranks = self.simd_eval5(&five_cards);
            
            // 更新每组的最高排名
            for i in 0..chunk.len() {
                if combo_ranks[i] > ranks[i] {
                    ranks[i] = combo_ranks[i];
                }
            }
        }
        
        // 写回结果
        for i in 0..chunk.len() {
            results[chunk_idx * CHUNK + i] = HandRank(ranks[i]);
        }
    }
}
```

### 2.6 收敛检测与提前终止

```rust
/// 使用正态近似计算 95% 置信区间
/// 当 CI 半宽 < target_precision 时提前终止
fn should_stop(
    wins: u64,
    ties: u64,
    total: u64,
    target_precision: f64,
) -> bool {
    if total < 1000 {
        return false; // 至少需要 1000 次采样
    }
    
    let n = total as f64;
    let p = (wins as f64 + 0.5 * ties as f64) / n;
    let variance = p * (1.0 - p);
    let ci_half_width = 1.96 * (variance / n).sqrt();
    
    ci_half_width < target_precision
}
```

### 2.7 多线程并行

```rust
use rayon::prelude::*;

impl<E: Evaluator + Sync> MonteCarloCalculator<E> {
    pub fn calculate_parallel(
        &self,
        hero: [Card; 2],
        villains: Vec<VillainRange>,
        board: &[Card],
        dead: &[Card],
        config: &MonteCarloConfig,
    ) -> EquityResult {
        let threads = if config.threads == 0 {
            num_cpus::get() as u32
        } else {
            config.threads
        };
        
        let iterations_per_thread = config.iterations / threads;
        
        // 为每个线程预分配独立的 RNG
        let seeds: Vec<u64> = (0..threads)
            .map(|i| config.seed.unwrap_or(0) + i as u64)
            .collect();
        
        // 并行执行
        let partial_results: Vec<PartialResult> = seeds
            .into_par_iter()
            .map(|seed| {
                let mut rng = StdRng::seed_from_u64(seed);
                self.run_iterations(
                    hero,
                    &villains,
                    board,
                    dead,
                    iterations_per_thread,
                    &mut rng,
                )
            })
            .collect();
        
        // 合并结果
        self.merge_results(partial_results)
    }
}
```

### 2.8 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 | 说明 |
|------|:---------:|:---------:|:-----|
| 单次模拟 | O(V × 7eval) | O(V) | V = villain 数量 |
| 7 牌评估 | O(21 × eval5) = O(1) | O(1) | eval5 是 O(1) |
| 总 Monte Carlo | O(N × V) | O(V) | N = iterations |
| 批量 SIMD | O(N × V / SIMD_WIDTH) | O(V × BATCH) | SIMD_WIDTH = 8-16 |

---

## 3. Exact Equity

### 3.1 问题定义

精确枚举所有可能的剩余发牌组合，计算 Hero 的胜率（无随机性，100% 准确）。

适用场景：
- 剩余未知牌数少（Flop 后通常 47 张未知，抽 2 张 = 1081 种组合）
- 需要 100% 精确结果
- 作为 Monte Carlo 的基准验证

### 3.2 精确枚举算法

```
输入: hero[2], villain_ranges[], board[], dead[]
输出: 精确 Equity

1. 构建剩余牌堆: deck = 52 - hero - board - dead - all_villain_cards_in_ranges
2. 确定还需发出的公共牌数: n = 5 - board.len()
3. 生成 deck 中所有 C(deck_size, n) 种组合
4. 对每种组合:
   a. 补齐公共牌
   b. 对每个 villain 范围，枚举所有不冲突的有效组合
   c. 评估所有玩家
   d. 确定胜负
   e. 累加统计
5. 返回精确 Equity
```

### 3.3 核心实现

```rust
pub struct ExactCalculator<E: Evaluator> {
    evaluator: E,
}

impl<E: Evaluator> ExactCalculator<E> {
    /// 精确计算两人底池权益
    /// 适用于 Flop/Turn/River 后的小规模场景
    pub fn calculate_2way(
        &self,
        hero: [Card; 2],
        villain_range: &[(Card, Card)], // 1326 种组合
        board: &[Card],
        dead: &[Card],
    ) -> EquityResult {
        let mut wins = 0u64;
        let mut ties = 0u64;
        let mut losses = 0u64;
        let mut total = 0u64;
        
        // 构建牌堆
        let mut deck = [Card(0); 52];
        let mut deck_size = 0usize;
        for i in 0..52 {
            let c = Card(i);
            if !board.contains(&c) && !dead.contains(&c) && c != hero[0] && c != hero[1] {
                deck[deck_size] = c;
                deck_size += 1;
            }
        }
        
        let remaining = 5 - board.len();
        
        // 枚举所有公共牌组合
        self.enumerate_combinations(&deck[..deck_size], remaining, |extra| {
            let mut full_board = [Card(0); 5];
            for i in 0..board.len() {
                full_board[i] = board[i];
            }
            for i in 0..remaining {
                full_board[board.len() + i] = extra[i];
            }
            
            // 枚举 villain 范围中所有有效组合
            for (vc1, vc2) in villain_range.iter() {
                // 检查是否与公共牌或 hero 牌冲突
                if full_board.contains(vc1) || full_board.contains(vc2) || *vc1 == hero[0] || *vc1 == hero[1] || *vc2 == hero[0] || *vc2 == hero[1] {
                    continue;
                }
                
                // 评估
                let hero_rank = self.evaluator.eval7([
                    hero[0], hero[1],
                    full_board[0], full_board[1], full_board[2], full_board[3], full_board[4]
                ]);
                let villain_rank = self.evaluator.eval7([
                    *vc1, *vc2,
                    full_board[0], full_board[1], full_board[2], full_board[3], full_board[4]
                ]);
                
                total += 1;
                match hero_rank.cmp(&villain_rank) {
                    Ordering::Greater => wins += 1,
                    Ordering::Equal => ties += 1,
                    Ordering::Less => losses += 1,
                }
            }
        });
        
        EquityResult {
            equity: (wins as f64 + 0.5 * ties as f64) / total as f64,
            win_probability: wins as f64 / total as f64,
            tie_probability: ties as f64 / total as f64,
            loss_probability: losses as f64 / total as f64,
            total_iterations: total as u32,
            elapsed_ms: 0,
            convergence: 0.0,
            vs_villains: vec![],
        }
    }
    
    /// 组合生成器（迭代器版本，避免递归）
    fn enumerate_combinations<F>(
        &self,
        deck: &[Card],
        k: usize,
        mut callback: F,
    ) where F: FnMut(&[Card]) {
        let n = deck.len();
        let mut indices: Vec<usize> = (0..k).collect();
        
        loop {
            let combo: Vec<Card> = indices.iter().map(|&i| deck[i]).collect();
            callback(&combo);
            
            // 生成下一个组合
            let mut i = k;
            loop {
                if i == 0 { return; }
                i -= 1;
                if indices[i] != i + n - k {
                    break;
                }
            }
            
            indices[i] += 1;
            for j in (i + 1)..k {
                indices[j] = indices[j - 1] + 1;
            }
        }
    }
}
```

### 3.4 精确 vs Monte Carlo 的切换策略

```rust
pub enum CalculationStrategy {
    Exact,
    MonteCarlo,
}

/// 自动选择计算策略
pub fn auto_strategy(
    hero: [Card; 2],
    villains: &[VillainRange],
    board: &[Card],
) -> CalculationStrategy {
    // 计算有效组合数
    let deck_size = 52 - 2 - board.len();
    let remaining = 5 - board.len();
    let combo_count = n_choose_k(deck_size, remaining);
    
    // 每个 villain 范围的有效组合数（平均）
    let avg_villain_combos: u64 = villains.iter()
        .map(|r| r.combinations_count() as u64)
        .product();
    
    let total_evaluations = combo_count * avg_villain_combos;
    
    // 阈值：2 百万次评估以内用精确枚举
    if total_evaluations <= 2_000_000 {
        CalculationStrategy::Exact
    } else {
        CalculationStrategy::MonteCarlo
    }
}
```

### 3.5 复杂度分析

| 场景 | 组合数 | 时间复杂度 | 空间复杂度 |
|------|:------:|:---------:|:---------:|
| Pre-flop (2way) | C(50,5) × 1225 ≈ 2.6B | O(2.6B) | O(1) |
| Flop (2way) | C(47,2) × ~900 ≈ 972K | O(1M) | O(1) |
| Turn (2way) | C(46,1) × ~900 ≈ 41K | O(41K) | O(1) |
| River (2way) | 直接评估 | O(1) | O(1) |
| Flop (3way, 各范围100) | C(47,2) × 100³ ≈ 10T | O(∞) | O(1) |

---

## 4. Range vs Range

### 4.1 问题定义

输入：两个范围（各 1326 种起手牌的加权子集）+ 公共牌  
输出：Range A vs Range B 的精确/近似权益

### 4.2 范围表示

#### 4.2.1 1326-bit 掩码表示

```rust
/// 范围：1326 种可能的两张牌组合
/// 用两个 u64 + 一个 u16 的 bit mask 表示
/// 实际使用: [u64; 21] = 1344 bits（超出部分不用）
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Range {
    /// 每个 bit 代表一种组合是否在该范围内
    /// 索引方式: (c1 * 51 + c2) where c1 < c2
    bits: [u64; 21], // 1344 bits
    /// 每个组合的权重（策略概率）
    /// 如果所有权重为 1.0，表示纯范围
    /// 如果权重不同，表示策略分布
    weights: [f32; 1326], // 可选，默认 1.0
}

impl Range {
    /// 从文本解析范围
    /// "AA, KK, AKs, AQo+, 66-99, T5s+, JTs-98s"
    pub fn parse(text: &str) -> Result<Self, ParseError> {
        let mut range = Range::empty();
        
        for token in text.split(',').map(|s| s.trim()) {
            if token.is_empty() { continue; }
            
            // 解析 token
            // "AA" => 所有 AA 组合 (6种)
            // "AKs" => 所有同花 AK (4种)
            // "AQo+" => AQo 及更强的非同花 Ax (AKo, AQo)
            // "66-99" => 66, 77, 88, 99
            // "T5s+" => T5s, T6s, T7s, ..., T9s
            // "JTs-98s" => JTs, T9s, 98s
            
            range.add_token(token)?;
        }
        
        Ok(range)
    }
    
    /// 添加一个手牌组合
    #[inline]
    pub fn add_combo(&mut self, c1: Card, c2: Card) {
        let idx = combo_index(c1, c2);
        let word = idx / 64;
        let bit = idx % 64;
        self.bits[word] |= 1u64 << bit;
    }
    
    /// 检查一个组合是否在范围内
    #[inline]
    pub fn contains(&self, c1: Card, c2: Card) -> bool {
        let idx = combo_index(c1, c2);
        let word = idx / 64;
        let bit = idx % 64;
        (self.bits[word] >> bit) & 1 == 1
    }
    
    /// 范围组合数
    pub fn combo_count(&self) -> u32 {
        self.bits.iter().map(|&w| w.count_ones()).sum()
    }
    
    /// 范围占所有组合的百分比
    pub fn percent(&self) -> f64 {
        self.combo_count() as f64 / 1326.0 * 100.0
    }
}

/// 组合索引: 将两张牌映射到 0-1325
#[inline(always)]
fn combo_index(c1: Card, c2: Card) -> usize {
    let a = c1.0 as usize;
    let b = c2.0 as usize;
    if a < b {
        a * 51 + b - 1 - (a * (a + 1)) / 2
    } else {
        b * 51 + a - 1 - (b * (b + 1)) / 2
    }
}
```

#### 4.2.2 13×13 矩阵表示（UI 层）

```rust
/// 13×13 矩阵用于可视化
/// 上半三角: suited (s)
/// 对角线: pairs (p)
/// 下半三角: offsuit (o)
#[derive(Clone, Debug)]
pub struct RangeMatrix {
    /// 13×13 的每个格子包含该手牌的组合数和权重
    cells: [[Cell; 13]; 13],
}

#[derive(Clone, Copy, Debug, Default)]
pub struct Cell {
    pub total_combos: u8,      // 该手牌的总组合数 (1, 4, 6, 12, 16)
    pub active_combos: u8,     // 在范围内的组合数
    pub weight: f32,           // 平均权重
}

impl RangeMatrix {
    /// 从 1326-bit Range 转换
    pub fn from_range(range: &Range) -> Self {
        // 实现...
    }
    
    /// 转回 1326-bit Range
    pub fn to_range(&self) -> Range {
        // 实现...
    }
    
    /// 获取特定位置的手牌（如 "AKs"）
    pub fn hand_cell(&self, hand: &str) -> Option<Cell> {
        // 解析 "AKs" => (A, K, suited)
        // 返回对应 cell
    }
}
```

### 4.3 范围代数运算

```rust
impl Range {
    /// 并集: A ∪ B
    #[inline]
    pub fn union(&self, other: &Range) -> Range {
        let mut result = self.clone();
        for i in 0..21 {
            result.bits[i] |= other.bits[i];
        }
        result
    }
    
    /// 交集: A ∩ B
    #[inline]
    pub fn intersection(&self, other: &Range) -> Range {
        let mut result = self.clone();
        for i in 0..21 {
            result.bits[i] &= other.bits[i];
        }
        result
    }
    
    /// 差集: A - B
    #[inline]
    pub fn difference(&self, other: &Range) -> Range {
        let mut result = self.clone();
        for i in 0..21 {
            result.bits[i] &= !other.bits[i];
        }
        result
    }
    
    /// 补集: ~A
    #[inline]
    pub fn complement(&self) -> Range {
        let mut result = Range::full();
        for i in 0..21 {
            result.bits[i] &= !self.bits[i];
        }
        result
    }
    
    /// 条件过滤: 保留满足条件的组合
    pub fn filter<F>(&self, board: &[Card], predicate: F) -> Range
    where F: Fn([Card; 2], &[Card]) -> bool {
        let mut result = Range::empty();
        self.iter_combos(|c1, c2| {
            if predicate([c1, c2], board) {
                result.add_combo(c1, c2);
            }
        });
        result
    }
}

/// 常用过滤器
pub mod filters {
    use super::*;
    
    /// 同花听牌 (4 cards to flush)
    pub fn flush_draw(hand: [Card; 2], board: &[Card]) -> bool {
        let suit_counts = count_suits(&[hand[0], hand[1], board]);
        suit_counts.values().any(|&c| c == 4)
    }
    
    /// 顺子听牌 (4 cards to straight)
    pub fn straight_draw(hand: [Card; 2], board: &[Card]) -> bool {
        // 实现...
    }
    
    /// 超对 (pocket pair > top board card)
    pub fn overpair(hand: [Card; 2], board: &[Card]) -> bool {
        if hand[0].rank() != hand[1].rank() { return false; }
        let top_board = board.iter().map(|c| c.rank()).max().unwrap_or(0);
        hand[0].rank() > top_board
    }
    
    /// 顶对 (paired with top board card)
    pub fn top_pair(hand: [Card; 2], board: &[Card]) -> bool {
        let top_board = board.iter().map(|c| c.rank()).max().unwrap_or(0);
        hand[0].rank() == top_board || hand[1].rank() == top_board
    }
    
    /// 中对
    pub fn middle_pair(hand: [Card; 2], board: &[Card]) -> bool {
        // 实现...
    }
    
    /// 底对
    pub fn bottom_pair(hand: [Card; 2], board: &[Card]) -> bool {
        // 实现...
    }
    
    /// 两对
    pub fn two_pair(hand: [Card; 2], board: &[Card]) -> bool {
        // 实现...
    }
    
    /// 三条
    pub fn three_of_kind(hand: [Card; 2], board: &[Card]) -> bool {
        // 实现...
    }
    
    /// 暗三条 (set)
    pub fn set(hand: [Card; 2], board: &[Card]) -> bool {
        hand[0].rank() == hand[1].rank() &&
        board.iter().any(|c| c.rank() == hand[0].rank())
    }
}
```

### 4.4 Range vs Range 权益计算

```rust
/// Range vs Range 权益计算
/// 
/// 核心公式:
/// E(R1, R2, board) = Σ(c1∈R1) Σ(c2∈R2, c2≠c1) [Equity(c1, c2, board)] / (|R1| × |R2_valid|)
pub fn range_vs_range(
    &self,
    range_a: &Range,
    range_b: &Range,
    board: &[Card],
    config: &EquityConfig,
) -> EquityResult {
    let combos_a = range_a.to_combos();
    let combos_b = range_b.to_combos();
    
    // 小规模: 精确枚举
    let total_matchups = combos_a.len() * combos_b.len();
    if total_matchups <= 1_000_000 {
        self.exact_range_vs_range(&combos_a, &combos_b, board)
    } else {
        // 大规模: Monte Carlo 采样 matchup
        self.monte_carlo_range_vs_range(&combos_a, &combos_b, board, config)
    }
}

/// 精确 RvR：枚举所有 matchup
fn exact_range_vs_range(
    &self,
    combos_a: &[(Card, Card)],
    combos_b: &[(Card, Card)],
    board: &[Card],
) -> EquityResult {
    let mut wins = 0u64;
    let mut ties = 0u64;
    let mut total = 0u64;
    
    for (a1, a2) in combos_a {
        for (b1, b2) in combos_b {
            // 检查冲突
            if *a1 == *b1 || *a1 == *b2 || *a2 == *b1 || *a2 == *b2 {
                continue;
            }
            if board.contains(a1) || board.contains(a2) || board.contains(b1) || board.contains(b2) {
                continue;
            }
            
            // 评估
            let equity = self.calculate_equity_exact(
                [*a1, *a2],
                [(*b1, *b2)],
                board,
            );
            
            total += 1;
            if equity > 0.5 { wins += 1; }
            else if equity == 0.5 { ties += 1; }
        }
    }
    
    EquityResult {
        equity: (wins as f64 + 0.5 * ties as f64) / total as f64,
        // ...
    }
}
```

### 4.5 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|:---------:|:---------:|
| 范围解析 | O(文本长度) | O(1) |
| 并/交/差 | O(21) = O(1) | O(1) |
| 过滤 | O(1326 × 评估) | O(1) |
| RvR 精确 | O(C(A) × C(B) × Eval) | O(1) |
| RvR Monte Carlo | O(N × Eval) | O(1) |

---

## 5. Nash Equilibrium

### 5.1 问题定义

在德州扑克的简化抽象博弈中，找到一个策略剖面（strategy profile），使得没有任何玩家可以通过单方面改变策略来增加期望收益。

形式化：
- 设 π_i 为玩家 i 的策略
- 设 u_i(π_i, π_{-i}) 为玩家 i 在策略剖面下的期望收益
- Nash 均衡满足：对所有 i，u_i(π_i^*, π_{-i}^*) ≥ u_i(π_i, π_{-i}^*) 对所有 π_i 成立

### 5.2 Epsilon-Nash

由于精确 Nash 均衡在复杂博弈中不可计算，使用近似概念：

**Epsilon-Nash (ε-Nash)**：
- 策略剖面 π^* 是 ε-Nash，如果对所有玩家 i：
  - u_i(π_i^*, π_{-i}^*) ≥ u_i(π_i, π_{-i}^*) - ε 对所有 π_i 成立
- 即：任何玩家单方面改变策略，最多只能增加 ε 的期望收益

**Exploitability（可利用度）**：
- 衡量策略距离 Nash 均衡的远近
- ε = (1/N) × Σ_i [max_{π_i'} u_i(π_i', π_{-i}^*) - u_i(π_i^*, π_{-i}^*)]
- ε = 0 时为精确 Nash 均衡

### 5.3 核心数据结构

```rust
/// 策略：信息集 → 动作概率分布
/// 信息集 = 玩家看到的所有信息（手牌 + 公共牌 + 历史行动）
pub type Strategy = HashMap<InfoSet, ActionDistribution>;

/// 信息集
#[derive(Clone, Debug, Hash, PartialEq, Eq)]
pub struct InfoSet {
    pub player: PlayerId,
    pub hand: [Card; 2],           // 或抽象化的桶
    pub board: Vec<Card>,
    pub action_history: Vec<Action>,
}

/// 动作概率分布
#[derive(Clone, Debug)]
pub struct ActionDistribution {
    /// 每个动作的概率（总和为 1.0）
    pub probs: Vec<(Action, f64)>,
}

/// 策略剖面
pub struct StrategyProfile {
    pub strategies: HashMap<PlayerId, Strategy>,
}

impl StrategyProfile {
    /// 计算可利用度
    pub fn exploitability(&self, game: &GameTree) -> f64 {
        // 对每个玩家，计算最佳响应收益
        // exploitability = 平均最佳响应差距
        todo!()
    }
}
```

---

## 6. CFR (Counterfactual Regret Minimization)

### 6.1 算法原理

CFR 由 Zinkevich et al. (2007) 提出，是求解不完美信息扩展式博弈 Nash 均衡的标准算法。

**核心思想**：
1. 迭代遍历博弈树
2. 在每个信息集上计算 Counterfactual Regret（反事实遗憾）
3. 使用 Regret Matching 更新策略
4. 策略平均值收敛到 Nash 均衡

**关键公式**：

**Counterfactual Value**（反事实值）：
```
v_i(I, a) = Σ_{z∈Z(I,a)} π_{-i}(z[I]) × π(z[I+1], z) × u_i(z)
```

其中：
- I = 信息集
- a = 动作
- z = 终止节点
- π_{-i} = 对手到达概率
- u_i(z) = 玩家 i 在终止节点 z 的收益

**Instantaneous Regret**（瞬时遗憾）：
```
r(I, a) = v_i(I, a) - Σ_a' [σ(I, a') × v_i(I, a')]
```

**Cumulative Regret**（累积遗憾）：
```
R^T(I, a) = Σ_{t=1}^{T} r^t(I, a)
```

**Regret Matching**（遗憾匹配策略）：
```
σ(I, a) = max(R(I, a), 0) / Σ_{a'} max(R(I, a'), 0)
```

### 6.2 核心实现

```rust
/// CFR 求解器
pub struct CFRSolver {
    /// 博弈树
    tree: GameTree,
    /// 每个信息集的累积遗憾: regrets[info_set][action] = cumulative_regret
    regrets: HashMap<InfoSetId, Vec<f64>>,
    /// 每个信息集的策略累加和（用于计算平均策略）
    strategy_sums: HashMap<InfoSetId, Vec<f64>>,
    /// 当前迭代数
    iteration: u64,
}

impl CFRSolver {
    pub fn new(tree: GameTree) -> Self {
        let mut regrets = HashMap::new();
        let mut strategy_sums = HashMap::new();
        
        for (info_set_id, actions) in tree.info_sets() {
            let num_actions = actions.len();
            regrets.insert(info_set_id, vec![0.0; num_actions]);
            strategy_sums.insert(info_set_id, vec![0.0; num_actions]);
        }
        
        Self {
            tree,
            regrets,
            strategy_sums,
            iteration: 0,
        }
    }
    
    /// 单次 CFR 迭代
    pub fn iterate(&mut self) {
        self.iteration += 1;
        
        // 对每个玩家分别进行一次遍历
        for player in 0..self.tree.num_players() {
            self.cfr_traverse(self.tree.root(), player, 1.0, 1.0);
        }
    }
    
    /// 递归遍历博弈树（CFR 核心）
    fn cfr_traverse(
        &mut self,
        node: NodeId,
        player: PlayerId,
        pi_player: f64,      // 当前玩家到达概率
        pi_others: f64,       // 对手到达概率
    ) -> f64 {
        match self.tree.node_type(node) {
            NodeType::Terminal => {
                // 终止节点：返回收益
                self.tree.utility(node, player)
            }
            
            NodeType::Chance => {
                // 机会节点（发牌）：遍历所有可能结果
                let mut value = 0.0;
                for (child, prob) in self.tree.chance_children(node) {
                    value += prob * self.cfr_traverse(child, player, pi_player, pi_others);
                }
                value
            }
            
            NodeType::Action(current_player) => {
                let info_set = self.tree.info_set(node);
                let info_set_id = info_set.id();
                let num_actions = info_set.num_actions();
                
                // 获取当前策略
                let strategy = self.get_strategy(info_set_id);
                
                // 计算每个动作的反事实值
                let mut action_values = vec![0.0; num_actions];
                let mut node_value = 0.0;
                
                for (a, child) in info_set.actions().iter().enumerate() {
                    if current_player == player {
                        // 当前玩家在思考：只更新自己的到达概率
                        action_values[a] = self.cfr_traverse(
                            child,
                            player,
                            pi_player * strategy[a],
                            pi_others,
                        );
                    } else {
                        // 对手在行动：更新对手的到达概率
                        action_values[a] = self.cfr_traverse(
                            child,
                            player,
                            pi_player,
                            pi_others * strategy[a],
                        );
                    }
                    
                    node_value += strategy[a] * action_values[a];
                }
                
                // 更新遗憾（只更新当前行动玩家的信息集）
                if current_player == player {
                    let regrets = self.regrets.get_mut(&info_set_id).unwrap();
                    let strategy_sum = self.strategy_sums.get_mut(&info_set_id).unwrap();
                    
                    for a in 0..num_actions {
                        // 反事实遗憾 = 反事实值差异
                        let regret = pi_others * (action_values[a] - node_value);
                        regrets[a] += regret;
                        
                        // 累加策略（用于计算平均策略）
                        strategy_sum[a] += pi_player * strategy[a];
                    }
                }
                
                node_value
            }
        }
    }
    
    /// 根据累积遗憾计算当前策略（Regret Matching）
    fn get_strategy(&self, info_set_id: InfoSetId) -> Vec<f64> {
        let regrets = self.regrets.get(&info_set_id).unwrap();
        let num_actions = regrets.len();
        
        let mut positive_regrets: Vec<f64> = regrets.iter()
            .map(|&r| if r > 0.0 { r } else { 0.0 })
            .collect();
        
        let total: f64 = positive_regrets.iter().sum();
        
        if total > 0.0 {
            positive_regrets.iter_mut().for_each(|r| *r /= total);
            positive_regrets
        } else {
            //  uniform random
            vec![1.0 / num_actions as f64; num_actions]
        }
    }
    
    /// 获取平均策略（Nash 均衡近似）
    pub fn get_average_strategy(&self, info_set_id: InfoSetId) -> Vec<f64> {
        let strategy_sum = self.strategy_sums.get(&info_set_id).unwrap();
        let total: f64 = strategy_sum.iter().sum();
        
        if total > 0.0 {
            strategy_sum.iter().map(|&s| s / total).collect()
        } else {
            let num_actions = strategy_sum.len();
            vec![1.0 / num_actions as f64; num_actions]
        }
    }
    
    /// 计算当前可利用度
    pub fn compute_exploitability(&self) -> f64 {
        // 构建当前平均策略剖面
        // 对每个玩家计算最佳响应
        // exploitability = 平均最佳响应差距
        todo!()
    }
}
```

### 6.3 复杂度分析

| 指标 | 复杂度 | 说明 |
|------|--------|------|
| 单次迭代 | O(\|树节点数\|) | 遍历整棵树 |
| 内存 | O(\|信息集数\| × 平均动作数) | 存储遗憾和策略累加 |
| 收敛 | O(1/ε²) 次迭代 | 达到 ε-Nash |

---

## 7. CFR+

### 7.1 改进点

CFR+ 由 Tammelin (2014) 提出，三大改进：

1. **交替更新 (Alternating Updates)**：每次迭代只更新一个玩家，而非同时更新所有玩家
2. **Regret Matching+**：负遗憾清零（不累积负遗憾）
   ```
   R+(I, a) = max(R(I, a), 0)
   ```
3. **线性加权平均策略**：平均策略用线性权重，而非均匀权重
   ```
   σ_avg^T = (2 / (T × (T+1))) × Σ_{t=1}^{T} (t × σ^t)
   ```

### 7.2 核心实现差异

```rust
/// CFR+ 求解器
pub struct CFRPlusSolver {
    base: CFRSolver,
    // CFR+ 特有：
    // 1. 交替更新：记录当前轮到哪个玩家
    current_update_player: PlayerId,
    // 2. 策略累加使用线性权重
}

impl CFRPlusSolver {
    /// CFR+ 迭代（交替更新）
    pub fn iterate(&mut self) {
        self.iteration += 1;
        
        // 只更新当前玩家
        let player = self.current_update_player;
        self.cfr_traverse(self.tree.root(), player, 1.0, 1.0);
        
        // 切换到下一个玩家
        self.current_update_player = (player + 1) % self.tree.num_players();
    }
    
    /// Regret Matching+：负遗憾清零
    fn update_regret_plus(&mut self, info_set_id: InfoSetId, action: usize, regret: f64) {
        let regrets = self.regrets.get_mut(&info_set_id).unwrap();
        regrets[action] += regret;
        
        // CFR+ 关键：负遗憾清零
        if regrets[action] < 0.0 {
            regrets[action] = 0.0;
        }
    }
    
    /// 线性加权策略累加
    fn accumulate_strategy_weighted(
        &mut self,
        info_set_id: InfoSetId,
        action: usize,
        prob: f64,
    ) {
        let strategy_sum = self.strategy_sums.get_mut(&info_set_id).unwrap();
        // 用当前迭代数作为权重
        strategy_sum[action] += self.iteration as f64 * prob;
    }
}
```

### 7.3 性能对比

| 算法 | 收敛速度 | 内存 | 适用场景 |
|------|:-------:|:----:|:---------|
| CFR | O(1/√T) | 中等 | 基准实现 |
| CFR+ | O(1/T) | 中等 | **推荐默认** |
| DCFR | O(1/T^{1.5}) | 中等 | 快速收敛需求 |

---

## 8. MCCFR (Monte Carlo CFR)

### 8.1 问题与动机

标准 CFR 每次迭代遍历整棵树，在大型博弈中不可行（如德州扑克完整博弈树节点数 > 10^18）。

MCCFR 通过**采样**来估计遗憾值，大幅减少每次迭代的计算量。

### 8.2 两种采样策略

#### 8.2.1 External Sampling (ES)

- 遍历当前玩家的所有动作
- 对对手和机会节点进行采样
- 适用于玩家自己的信息集

```
MCCFR-ES(node, player):
    if terminal: return utility
    if chance: 
        sample one outcome, return MCCFR-ES(child, player)
    if current player:
        for each action a:
            value[a] = MCCFR-ES(child(a), player)
        update regrets for all actions
        return Σ σ(a) × value[a]
    if opponent:
        sample one action a according to σ
        return MCCFR-ES(child(a), player)
```

#### 8.2.2 Outcome Sampling (OS)

- 采样单条完整路径到终止节点
- 更新整条路径上的所有信息集
- 需要重要性采样权重修正

```
MCCFR-OS(node, player, reach_prob):
    if terminal: 
        return utility / reach_prob  // 重要性采样修正
    if chance:
        sample outcome z with prob q(z)
        return MCCFR-OS(child(z), player, reach_prob × q(z))
    if action node:
        sample action a with prob σ(a)
        value = MCCFR-OS(child(a), player, reach_prob × σ(a))
        // 更新所有动作的遗憾
        for each action a':
            regret[a'] += (value if a' == a else 0) - σ(a) × value
        return value
```

### 8.3 核心实现

```rust
pub enum MCCFRVariant {
    ExternalSampling,
    OutcomeSampling { exploration: f64 },
}

pub struct MCCFRSolver {
    tree: GameTree,
    regrets: HashMap<InfoSetId, Vec<f64>>,
    strategy_sums: HashMap<InfoSetId, Vec<f64>>,
    iteration: u64,
    variant: MCCFRVariant,
}

impl MCCFRSolver {
    /// External Sampling MCCFR 迭代
    pub fn iterate_external_sampling(&mut self) {
        for player in 0..self.tree.num_players() {
            self.mccfr_es_traverse(self.tree.root(), player, 1.0, 1.0, player);
        }
        self.iteration += 1;
    }
    
    fn mccfr_es_traverse(
        &mut self,
        node: NodeId,
        player: PlayerId,
        pi_player: f64,
        pi_others: f64,
        traverse_player: PlayerId,
    ) -> f64 {
        match self.tree.node_type(node) {
            NodeType::Terminal => {
                self.tree.utility(node, traverse_player)
            }
            
            NodeType::Chance => {
                // 采样一个机会结果
                let outcomes = self.tree.chance_children(node);
                let (child, prob) = self.sample_chance(&outcomes);
                self.mccfr_es_traverse(child, player, pi_player, pi_others * prob, traverse_player)
            }
            
            NodeType::Action(current_player) => {
                let info_set = self.tree.info_set(node);
                let info_set_id = info_set.id();
                let num_actions = info_set.num_actions();
                let strategy = self.get_strategy(info_set_id);
                
                if current_player == traverse_player {
                    // 遍历所有动作
                    let mut action_values = vec![0.0; num_actions];
                    let mut node_value = 0.0;
                    
                    for (a, child) in info_set.actions().iter().enumerate() {
                        if current_player == player {
                            action_values[a] = self.mccfr_es_traverse(
                                child, player, pi_player * strategy[a], pi_others, traverse_player
                            );
                        } else {
                            action_values[a] = self.mccfr_es_traverse(
                                child, player, pi_player, pi_others * strategy[a], traverse_player
                            );
                        }
                        node_value += strategy[a] * action_values[a];
                    }
                    
                    // 更新遗憾
                    let regrets = self.regrets.get_mut(&info_set_id).unwrap();
                    let strategy_sum = self.strategy_sums.get_mut(&info_set_id).unwrap();
                    
                    for a in 0..num_actions {
                        let regret = pi_others * (action_values[a] - node_value);
                        regrets[a] += regret;
                        strategy_sum[a] += pi_player * strategy[a];
                    }
                    
                    node_value
                } else {
                    // 采样一个动作
                    let a = self.sample_action(&strategy);
                    let child = info_set.actions()[a];
                    
                    if current_player == player {
                        self.mccfr_es_traverse(child, player, pi_player * strategy[a], pi_others, traverse_player)
                    } else {
                        self.mccfr_es_traverse(child, player, pi_player, pi_others * strategy[a], traverse_player)
                    }
                }
            }
        }
    }
}
```

### 8.4 复杂度分析

| 指标 | CFR | MCCFR-ES | MCCFR-OS |
|------|:---:|:--------:|:--------:|
| 单次迭代 | O(\|树\|) | O(\|路径\| × A) | O(\|路径\|) |
| 收敛 | O(1/ε²) | O(1/ε²) | O(1/ε²) |
| 方差 | 0 | 低 | 高 |
| 适用 | 小树 | **大博弈** | 超大博弈 |

---

## 9. ICM (Independent Chip Model)

### 9.1 问题定义

锦标赛（SNG/MTT）中，筹码 ≠ 现金价值。ICM 将筹码堆转换为期望奖金（$EV）。

### 9.2 核心公式

**Malcolm-Harith ICM**（精确但计算量大）：
```
$EV_i = Σ_{k=1}^{n} P_i(finish_k) × Prize_k
```

其中 P_i(finish_k) 是玩家 i 第 k 名完成的概率。

**P_i(1st)** = stack_i / total_stack  
**P_i(2nd)** = Σ_{j≠i} [P_j(1st) × stack_i / (total_stack - stack_j)]  
**P_i(3rd)** = Σ_{j≠i} Σ_{k≠i,j} [P_j(1st) × P_k(2nd|j 1st) × stack_i / (total_stack - stack_j - stack_k)]

递归计算，复杂度 O(n!)。

### 9.3 实现

```rust
/// ICM 计算器
pub struct IcmCalculator {
    /// 奖金结构: [1st, 2nd, 3rd, ...]
    prizes: Vec<f64>,
}

impl IcmCalculator {
    /// 计算所有玩家的 ICM 权益
    pub fn calculate(&self, stacks: &[f64]) -> Vec<f64> {
        let n = stacks.len();
        let mut results = vec![0.0; n];
        
        // 递归计算每个玩家的完成名次概率
        let mut permutations = Vec::new();
        self.generate_permutations((0..n).collect(), &mut permutations);
        
        for perm in &permutations {
            // perm[0] = 1st, perm[1] = 2nd, ...
            let prob = self.permutation_probability(perm, stacks);
            for (rank, &player) in perm.iter().enumerate() {
                if rank < self.prizes.len() {
                    results[player] += prob * self.prizes[rank];
                }
            }
        }
        
        results
    }
    
    /// 计算特定排列的概率
    fn permutation_probability(&self, perm: &[usize], stacks: &[f64]) -> f64 {
        let mut prob = 1.0;
        let mut remaining_stacks: Vec<f64> = stacks.to_vec();
        
        for &player in perm {
            let total: f64 = remaining_stacks.iter().sum();
            prob *= remaining_stacks[player] / total;
            remaining_stacks[player] = 0.0; // 该玩家已被淘汰
        }
        
        prob
    }
    
    /// 计算 fold 的 $EV 和 call 的 $EV
    pub fn decision_ev(
        &self,
        stacks: &[f64],
        player: usize,
        call_amount: f64,
        equity_if_call: f64,
    ) -> (f64, f64) {
        let icm_current = self.calculate(stacks)[player];
        
        // Fold 后：玩家损失 call_amount 筹码
        let mut fold_stacks = stacks.to_vec();
        fold_stacks[player] -= call_amount;
        let icm_fold = self.calculate(&fold_stacks)[player];
        
        // Call 并赢：玩家获得 pot
        let mut win_stacks = stacks.to_vec();
        // ... 根据具体场景调整筹码
        let icm_win = self.calculate(&win_stacks)[player];
        
        // Call 并输：玩家被淘汰
        let mut lose_stacks = stacks.to_vec();
        lose_stacks[player] = 0.0;
        let icm_lose = self.calculate(&lose_stacks)[player];
        
        let icm_call = equity_if_call * icm_win + (1.0 - equity_if_call) * icm_lose;
        
        (icm_fold, icm_call)
    }
}
```

### 9.4 复杂度分析

| 玩家数 | 排列数 | 计算时间 | 优化方案 |
|:------:|:------:|:--------:|:---------|
| 3 | 6 | 微秒 | 精确计算 |
| 4 | 24 | 微秒 | 精确计算 |
| 5 | 120 | 毫秒 | 精确计算 |
| 6 | 720 | 毫秒 | 精确计算 |
| 7 | 5040 | 秒 | 近似/模拟 |
| 9 | 362880 | 分钟 | **Monte Carlo ICM** |

---

## 10. Tournament Mathematics

### 10.1 锦标赛特有计算

```rust
/// 锦标赛计算器
pub struct TournamentCalculator {
    icm: IcmCalculator,
}

impl TournamentCalculator {
    /// Push/Fold 范围计算（短筹码）
    /// 基于 ICM + 手牌权益
    pub fn push_fold_range(
        &self,
        stacks: &[f64],
        blinds: (f64, f64), // (SB, BB)
        ante: f64,
        position: Position,
        player_idx: usize,
    ) -> Range {
        let mut pushing_range = Range::empty();
        let effective_stack = stacks[player_idx] / blinds.1; // 以 BB 为单位
        
        // 对每种起手牌组合
        for combo in all_combos() {
            let ev_fold = self.icm_fold_ev(stacks, player_idx);
            let ev_push = self.icm_push_ev(stacks, player_idx, combo, blinds, ante, position);
            
            if ev_push > ev_fold {
                pushing_range.add_combo(combo.0, combo.1);
            }
        }
        
        pushing_range
    }
    
    /// 独立筹码模型下的全押期望
    fn icm_push_ev(
        &self,
        stacks: &[f64],
        player: usize,
        hand: (Card, Card),
        blinds: (f64, f64),
        ante: f64,
        position: Position,
    ) -> f64 {
        let pot = blinds.0 + blinds.1 + ante * stacks.len() as f64;
        let all_in_amount = stacks[player].min(stacks[/* caller */]);
        
        // 估算 call 频率（基于对手范围）
        let call_range = self.estimate_calling_range(stacks, position);
        let call_freq = call_range.percent() / 100.0;
        
        // 被 call 时的手牌权益
        let equity_vs_call_range = self.equity_vs_range(hand, &call_range);
        
        // ICM 计算
        let (icm_fold, _) = self.icm.decision_ev(stacks, player, blinds.1, 0.0);
        
        // 被 call 并赢
        let mut win_stacks = stacks.to_vec();
        win_stacks[player] += pot + all_in_amount;
        win_stacks[/* caller */] -= all_in_amount;
        let icm_win = self.icm.calculate(&win_stacks)[player];
        
        // 被 call 并输
        let mut lose_stacks = stacks.to_vec();
        lose_stacks[player] = 0.0;
        lose_stacks[/* caller */] += pot + stacks[player];
        let icm_lose = self.icm.calculate(&lose_stacks)[player];
        
        // 所有人 fold
        let mut fold_stacks = stacks.to_vec();
        fold_stacks[player] += pot;
        let icm_uncontested = self.icm.calculate(&fold_stacks)[player];
        
        // 综合期望
        let ev = (1.0 - call_freq) * icm_uncontested
               + call_freq * (equity_vs_call_range * icm_win + (1.0 - equity_vs_call_range) * icm_lose);
        
        ev
    }
    
    /// 估算对手跟注范围（基于筹码深度和位置）
    fn estimate_calling_range(&self, stacks: &[f64], position: Position) -> Range {
        // 基于 Nash 均衡近似
        // 短筹码 → 更宽范围
        // 深筹码 → 更紧范围
        todo!()
    }
}
```

---

## 11. Multiway Equity

### 11.1 问题定义

3+ 玩家底池中的权益计算。

复杂性：
- 两人底池：赢/平/输
- 三人底池：赢/两人平分/三人平分/第二/第三
- 边池（Side Pot）使分配更复杂

### 11.2 核心算法

```rust
/// 多人底池权益计算器
pub struct MultiwayCalculator<E: Evaluator> {
    evaluator: E,
}

impl<E: Evaluator> MultiwayCalculator<E> {
    /// 计算多人底池权益
    /// 
    /// 注意：这里只计算主池权益
    /// 边池计算见 Side Pot 章节
    pub fn calculate_multiway(
        &self,
        hands: Vec<[Card; 2]>,        // 所有玩家的手牌
        ranges: Vec<Option<Range>>,   // 如果有玩家用范围而非具体手牌
        board: &[Card],
        dead: &[Card],
        config: &MonteCarloConfig,
    ) -> MultiwayEquityResult {
        // 如果有任何玩家使用范围，必须用 Monte Carlo
        let use_mc = ranges.iter().any(|r| r.is_some());
        
        if use_mc {
            self.monte_carlo_multiway(&hands, &ranges, board, dead, config)
        } else {
            // 所有人都是具体手牌，可以尝试精确枚举
            let deck_size = 52 - hands.len() * 2 - board.len() - dead.len();
            let remaining = 5 - board.len();
            let combos = n_choose_k(deck_size, remaining);
            
            if combos <= 2_000_000 {
                self.exact_multiway(&hands, board, dead)
            } else {
                self.monte_carlo_multiway(&hands, &ranges, board, dead, config)
            }
        }
    }
    
    /// 精确多人底池枚举
    fn exact_multiway(
        &self,
        hands: &[[Card; 2]],
        board: &[Card],
        dead: &[Card],
    ) -> MultiwayEquityResult {
        let num_players = hands.len();
        let mut wins = vec![0u64; num_players];
        let mut ties = vec![0u64; num_players];  // 参与平分的次数
        let mut total = 0u64;
        
        // 构建牌堆
        let mut deck = vec![];
        for i in 0..52 {
            let c = Card(i);
            let mut used = board.contains(&c) || dead.contains(&c);
            for hand in hands {
                if hand[0] == c || hand[1] == c { used = true; }
            }
            if !used { deck.push(c); }
        }
        
        let remaining = 5 - board.len();
        
        // 枚举所有公共牌组合
        self.enumerate_combinations(&deck, remaining, |extra| {
            let mut full_board = board.to_vec();
            full_board.extend_from_slice(extra);
            
            // 评估所有玩家
            let mut ranks: Vec<(usize, HandRank)> = hands.iter().enumerate()
                .map(|(i, hand)| {
                    let seven = [
                        hand[0], hand[1],
                        full_board[0], full_board[1], full_board[2],
                        full_board[3], full_board[4],
                    ];
                    (i, self.evaluator.eval7(seven))
                })
                .collect();
            
            // 按排名排序（降序）
            ranks.sort_by(|a, b| b.1.cmp(&a.1));
            
            // 确定胜负
            let best_rank = ranks[0].1;
            let winners: Vec<usize> = ranks.iter()
                .take_while(|(_, rank)| *rank == best_rank)
                .map(|(i, _)| *i)
                .collect();
            
            total += 1;
            
            if winners.len() == 1 {
                wins[winners[0]] += 1;
            } else {
                // 平分
                for &w in &winners {
                    ties[w] += 1;
                }
            }
        });
        
        MultiwayEquityResult {
            equities: wins.iter().zip(ties.iter())
                .map(|(w, t)| (*w as f64 + *t as f64 / winners_count) / total as f64)
                .collect(),
            total_iterations: total as u32,
        }
    }
    
    /// Monte Carlo 多人底池
    fn monte_carlo_multiway(
        &self,
        hands: &[[Card; 2]],
        ranges: &[Option<Range>],
        board: &[Card],
        dead: &[Card],
        config: &MonteCarloConfig,
    ) -> MultiwayEquityResult {
        // 类似两人 Monte Carlo，但评估 N 个玩家
        // 每轮采样：
        // 1. 对范围玩家采样手牌
        // 2. 发出剩余公共牌
        // 3. 评估所有玩家
        // 4. 确定名次和分配
        todo!()
    }
}

/// 多人底池结果
#[derive(Clone, Debug)]
pub struct MultiwayEquityResult {
    /// 每个玩家的权益（总和 = 1.0）
    pub equities: Vec<f64>,
    /// 每个玩家的胜率
    pub win_probabilities: Vec<f64>,
    /// 每个玩家的平分概率
    pub tie_probabilities: Vec<f64>,
    pub total_iterations: u32,
    pub elapsed_ms: u64,
}
```

### 11.3 复杂度分析

| 玩家数 | 精确枚举 | Monte Carlo | 说明 |
|:------:|:-------:|:-----------:|:-----|
| 2 | C(48,5)=1.7M | 100K | 可行 |
| 3 | C(46,5)=1.4M × matchups | 100K-1M | 精确较复杂 |
| 4+ | 不可行 | 1M+ | 必须用 MC |

---

## 12. Side Pot Calculation

### 12.1 问题定义

当玩家 all-in 且筹码少于其他玩家时，产生边池（Side Pot）。

每个边池独立结算，all-in 玩家只能赢得自己参与的边池。

### 12.2 算法

```rust
/// 边池计算
/// 
/// 输入: 所有玩家的手牌、下注金额
/// 输出: 每个玩家赢得的筹码
pub fn calculate_side_pots(
    players: &[PlayerState],  // 手牌 + 下注 + 是否 all-in
    board: &[Card],
    evaluator: &impl Evaluator,
) -> Vec<f64> {
    let mut winnings = vec![0.0; players.len()];
    
    // Step 1: 按 all-in 金额排序，确定边池层级
    let mut sorted_players: Vec<(usize, f64)> = players.iter().enumerate()
        .map(|(i, p)| (i, p.bet))
        .collect();
    sorted_players.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap());
    
    // Step 2: 构建边池
    let mut side_pots: Vec<SidePot> = vec![];
    let mut previous_bet = 0.0;
    
    for &(player_idx, bet) in &sorted_players {
        if bet > previous_bet {
            // 新建一个边池
            let pot_amount = (bet - previous_bet) * eligible_players as f64;
            let eligible: Vec<usize> = players.iter().enumerate()
                .filter(|(i, p)| p.bet >= bet && !p.folded)
                .map(|(i, _)| i)
                .collect();
            
            side_pots.push(SidePot {
                amount: pot_amount,
                eligible_players: eligible,
            });
            
            previous_bet = bet;
        }
    }
    
    // Step 3: 对每个边池独立结算
    for pot in &side_pots {
        // 找出 eligible 玩家中的胜者
        let mut best_rank = HandRank(0);
        let mut winners = vec![];
        
        for &player_idx in &pot.eligible_players {
            let hand = players[player_idx].hand;
            let seven = [
                hand[0], hand[1],
                board[0], board[1], board[2], board[3], board[4],
            ];
            let rank = evaluator.eval7(seven);
            
            if rank > best_rank {
                best_rank = rank;
                winners = vec![player_idx];
            } else if rank == best_rank {
                winners.push(player_idx);
            }
        }
        
        // 分配边池
        let share = pot.amount / winners.len() as f64;
        for &w in &winners {
            winnings[w] += share;
        }
    }
    
    winnings
}

#[derive(Clone, Debug)]
struct SidePot {
    amount: f64,
    eligible_players: Vec<usize>,
}

#[derive(Clone, Debug)]
struct PlayerState {
    hand: [Card; 2],
    bet: f64,
    folded: bool,
    all_in: bool,
}
```

---

## 13. 复杂度与性能分析

### 13.1 各算法复杂度总览

| 算法 | 输入规模 | 时间复杂度 | 空间复杂度 | 精确度 |
|------|:-------:|:---------:|:---------:|:------:|
| Hand Eval (5-card) | 5 | O(1) | O(1) | 精确 |
| Hand Eval (7-card) | 7 | O(21) = O(1) | O(1) | 精确 |
| Exact Equity (2way, Flop) | 47 cards | O(C(47,2)×C) | O(1) | 精确 |
| Exact Equity (2way, Pre) | 50 cards | O(C(50,5)×C) | O(1) | 精确 |
| Monte Carlo (2way) | N iterations | O(N×V) | O(V) | ±0.1%@100K |
| Range vs Range | C(A)×C(B) | O(C(A)×C(B)×E) | O(1) | 精确/MC |
| CFR 迭代 | \|树\| | O(\|树\|) | O(\|信息集\|) | 渐进精确 |
| DCFR 收敛 | ε | O(1/ε^{1.5}) | O(\|信息集\|) | ε-Nash |
| ICM | n players | O(n!) | O(n) | 精确 |
| Multiway (3p) | 46 cards | O(C(46,2)×M) | O(P) | 精确/MC |
| Side Pot | P players | O(P × E) | O(P) | 精确 |

### 13.2 性能基准（目标）

| 操作 | 单线程 | 8线程 | WASM | 备注 |
|------|:------:|:-----:|:----:|:-----|
| 5 牌评估 | 3ns | 3ns | 5ns | — |
| 7 牌评估 | 150ns | 50ns | 300ns | AVX2 |
| 100K MC (2way, Flop) | 50ms | 8ms | 200ms | — |
| 1M MC (2way, Pre) | 500ms | 80ms | 2s | — |
| Exact (Flop, 2way) | 100ms | — | 400ms | — |
| RvR (各100 combos) | 50ms | 8ms | 200ms | — |
| CFR 迭代 (小型树) | 100ms | 20ms | 不可行 | — |
| ICM (9 players) | 1s | — | 5s | 用 MC 近似 |

---

## 14. 优化方向

### 14.1 SIMD 优化矩阵

| 算法 | SIMD 可行 | 预期加速 | 实现难度 |
|------|:--------:|:-------:|:-------:|
| 5 牌评估 | ✅ | 4-8x | 中 |
| 7 牌评估 | ✅ | 8-16x | 高 |
| MC 批量评估 | ✅ | 8-16x | 中 |
| 精确枚举 | ⚠️ | 2-4x | 高 |
| CFR 遍历 | ❌ | — | — |
| Range 运算 | ✅ | 32x (bitwise) | 低 |

### 14.2 GPU 加速

**适用场景**：
- ✅ Monte Carlo 大规模模拟（100M+ iterations）
- ✅ CFR 批量信息集更新
- ✅ Range vs Range 全矩阵计算
- ❌ 精确枚举（分支不规则）
- ❌ 单树遍历（内存访问不连续）

**GPU 架构**：
```
CUDA / OpenCL Kernel:
  - 每个 thread 处理一组独立的 matchup
  - Shared memory 存储查找表
  - Atomic add 累加统计
  
预期加速：
  - RTX 4090: 100-500x vs 单线程 CPU
  - 但受限于 PCIe 传输开销，小任务反而更慢
```

### 14.3 WASM 优化

| 技术 | 效果 | 实现 |
|------|:----:|:----:|
| `wasm-bindgen` 批量接口 | 减少 JS↔WASM 调用开销 10x | ✅ |
| `SharedArrayBuffer` + Worker | 多线程 WASM | ✅ |
| `bulk-memory` | 加速内存拷贝 | ✅ |
| `atomics` | 线程同步 | ✅ |
| `-Oz` 编译 | 减小 WASM 体积 | ✅ |
| 查找表压缩 | 减小内存占用 | ⚠️ |

### 14.4 Rust 特定优化

```rust
// 1. #[inline(always)] 关键路径
// 2. const fn 编译时计算
// 3. unsafe + raw pointer 在热点代码（谨慎使用）
// 4. 避免 Vec 分配，用固定数组
// 5. 使用 iter() + fold() 利用 SIMD auto-vectorization
// 6. Profile-guided optimization (PGO)
// 7. Link-time optimization (LTO)
```

---

## 15. 未来升级路线

### 15.1 短期 (v0.5–v1.0)

| 优先级 | 功能 | 技术 |
|:------:|------|------|
| P0 | Hand Evaluator (Perfect Hash) | Rust + WASM |
| P0 | Monte Carlo (2-way) | Rust + WASM + Worker |
| P0 | Exact Equity (Flop/Turn) | Rust |
| P1 | Range vs Range | 1326-bit mask |
| P1 | Multiway (3-4 players) | Monte Carlo |
| P1 | Side Pot | 精确计算 |
| P2 | ICM (3-6 players) | 精确 + MC |
| P2 | Tournament Push/Fold | Nash 近似 |

### 15.2 中期 (v1.0–v1.5)

| 优先级 | 功能 | 技术 |
|:------:|------|------|
| P0 | CFR/DCFR 求解器 | Rust (native only) |
| P0 | 2-player postflop GTO | DCFR + abstraction |
| P1 | CFR+ 实现 | Rust |
| P1 | MCCFR (External Sampling) | Rust |
| P2 | Omaha (PLO) 评估 | 扩展 evaluator |
| P2 | Short Deck 评估 | 适配 36 张牌 |

### 15.3 长期 (v1.5–v2.0)

| 优先级 | 功能 | 技术 |
|:------:|------|------|
| P0 | GPU 加速 (CUDA) | Monte Carlo / CFR batch |
| P0 | 3-6 player GTO | MCCFR + abstraction |
| P1 | Deep CFR (神经网络) | PyTorch / ONNX |
| P1 | Real-time solver | WASM streaming |
| P2 | Voice/image input | ML pipeline |
| P2 | Cloud distributed solver | Kubernetes + GPU cluster |

### 15.4 技术债务与迁移路径

```
v0.1 (Foundation)
  └── Hand Evaluator (Rust)
  └── MC Equity (Rust + WASM)
  └── Exact Equity (Rust)
       │
       ▼
v0.5 (Solver Core)
  └── Range System (Rust)
  └── CFR Base (Rust)
  └── Multiway (Rust)
       │
       ▼
v1.0 (Full Suite)
  └── DCFR (Rust)
  └── CFR+ (Rust)
  └── MCCFR (Rust)
  └── ICM + Tournament (Rust)
       │
       ▼
v1.5 (Advanced)
  └── GPU Kernel (CUDA)
  └── Deep CFR (PyTorch)
  └── Omaha Evaluator
       │
       ▼
v2.0 (Ecosystem)
  └── Cloud Solver API
  └── Real-time Assistant
  └── AI Agent Integration
```

---

## 附录 A: 关键常数

| 常数 | 值 | 说明 |
|------|:---:|:-----|
| 52 选 2 | 1,326 | 所有起手牌组合 |
| 52 选 5 | 2,598,960 | 所有 5 牌组合 |
| 52 选 7 | 133,784,560 | 所有 7 牌组合 |
| C(50,5) | 2,118,760 | Pre-flop 公共牌组合 |
| C(47,2) | 1,081 | Flop 后剩余组合 |
| C(46,1) | 46 | Turn 后剩余组合 |
| 5 牌排名 | 7,463 (0–7462) | 所有可能的牌型强度 |
| 169 类 | 13×13 | 不考虑花色的手牌分类 |
| 信息集 (2p abstract) | ~10^14 | 完整博弈（不可解）|
| 信息集 (2p, single raised pot) | ~10^11 | 部分场景 |

---

## 附录 B: 算法选择决策树

```
问题类型?
├── 牌型评估
│   └── 牌数?
│       ├── 5 → Perfect Hash (3ns)
│       ├── 6 → 枚举 6 选 5 = 6 种
│       └── 7 → 枚举 21 种 (150ns)
│
├── 权益计算
│   └── 玩家数?
│       ├── 2人
│       │   └── 组合数 ≤ 2M?
│       │       ├── 是 → Exact Enumeration
│       │       └── 否 → Monte Carlo (100K+)
│       └── 3+人
│           └── 范围?
│               ├── 无 → 精确或 MC
│               └── 有 → Monte Carlo (1M+)
│
├── 范围运算
│   └── 操作?
│       ├── 并/交/差 → Bitmask (O(1))
│       ├── 过滤 → 逐组合评估 (O(1326))
│       └── RvR → 精确/MC 取决于规模
│
├── GTO 求解
│   └── 树大小?
│       ├── 小型 (< 10^8 节点) → CFR+
│       ├── 中型 → DCFR
│       └── 大型 → MCCFR-ES
│
├── 锦标赛
│   └── 玩家数?
│       ├── ≤6 → 精确 ICM
│       └── >6 → Monte Carlo ICM
│
└── 边池
    └── 精确计算 (O(P × E))
```

---

> **文档结束**。本设计为 Poker Suite 算法栈的完整蓝图，涵盖从底层牌型评估到高层博弈论求解的全部核心算法，并给出了复杂度分析、性能目标和未来演进路线。
