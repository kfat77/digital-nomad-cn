//! OpenPoker — The Open Poker Intelligence Platform
//!
//! Unified facade crate that re-exports all core functionality.

pub mod prelude;

// Re-export all sub-crates
pub use poker_types as types;
pub use poker_eval as eval;
pub use poker_equity as equity;
pub use poker_range as range;
pub use poker_solver as solver;
pub use poker_parser as parser;
pub use poker_trainer as trainer;
