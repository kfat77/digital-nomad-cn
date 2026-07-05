//! GTO Solver
//!
//! Counterfactual Regret Minimization (CFR/CFR+/DCFR/MCCFR) solver engine.

pub mod tree;
pub mod cfr;
pub mod strategy;
pub mod exploitability;
pub mod config;

pub use tree::*;
pub use cfr::*;
pub use strategy::*;
