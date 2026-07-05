use poker_types::HandRange;
pub struct RangeSet { ranges: Vec<HandRange> }
impl RangeSet { pub fn new() -> Self { RangeSet { ranges: Vec::new() } } pub fn add(&mut self, range: HandRange) { self.ranges.push(range); } pub fn len(&self) -> usize { self.ranges.len() } pub fn is_empty(&self) -> bool { self.ranges.is_empty() } }
impl Default for RangeSet { fn default() -> Self { Self::new() } }