//! Unified interface.
use crate::matchup::heads_up_exact;
use crate::monte_carlo::{monte_carlo_heads_up, monte_carlo_multiway};
use crate::multiway::multiway_exact;
use poker_types::Card;
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CalculationMethod { Auto, Exact, MonteCarlo }
#[derive(Debug, Clone)]
pub struct EquityConfig { pub method: CalculationMethod, pub mc_simulations: u64, pub max_exact_remaining: usize }
impl Default for EquityConfig { fn default() -> Self { EquityConfig { method: CalculationMethod::Auto, mc_simulations: 100_000, max_exact_remaining: 2 } } }
#[derive(Debug, Clone, PartialEq)]
pub struct EquityResult { pub equities: Vec<f64>, pub sample_size: u64, pub is_exact: bool }
pub fn calculate_equity_heads_up(hero: &[Card], villain: &[Card], board: &[Card], config: &EquityConfig) -> EquityResult { let rem = 5 - board.len(); let ue = match config.method { CalculationMethod::Exact => true, CalculationMethod::MonteCarlo => false, CalculationMethod::Auto => rem <= config.max_exact_remaining }; if ue { let r = heads_up_exact(hero, villain, board); EquityResult { equities: vec![r.hero_equity, r.villain_equity], sample_size: r.total_outcomes, is_exact: true } } else { let r = monte_carlo_heads_up(hero, villain, board, config.mc_simulations); EquityResult { equities: r.equities, sample_size: r.total_simulations, is_exact: false } } }
pub fn calculate_equity_multiway(hands: &[Vec<Card>], board: &[Card], config: &EquityConfig) -> EquityResult { let rem = 5 - board.len(); let ue = match config.method { CalculationMethod::Exact => true, CalculationMethod::MonteCarlo => false, CalculationMethod::Auto => rem <= config.max_exact_remaining && hands.len() <= 3 }; if ue { let r = multiway_exact(hands, board); EquityResult { equities: r.equities, sample_size: r.total_outcomes, is_exact: true } } else { let r = monte_carlo_multiway(hands, board, config.mc_simulations); EquityResult { equities: r.equities, sample_size: r.total_simulations, is_exact: false } } }