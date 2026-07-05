use poker_types::HandRange;
pub fn union(ranges: &[HandRange]) -> HandRange { let mut r = HandRange::empty(); for x in ranges { r = r.union(x); } r }
pub fn intersection(ranges: &[HandRange]) -> HandRange { if ranges.is_empty() { return HandRange::empty(); } let mut r = ranges[0]; for x in &ranges[1..] { r = r.intersection(x); } r }