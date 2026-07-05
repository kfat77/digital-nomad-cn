//! Exact enumeration.
use crate::matchup::heads_up_exact;
use poker_types::Card;
pub type ExactResult = crate::matchup::MatchupResult;
pub fn exact_equity(hero: &[Card], villain: &[Card], board: &[Card]) -> ExactResult { heads_up_exact(hero, villain, board) }