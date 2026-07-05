use poker_types::{HandRange, Result};
pub fn parse_range(s: &str) -> Result<HandRange> { HandRange::from_str(s) }