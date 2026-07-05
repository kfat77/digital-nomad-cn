use crate::card::{Card, Rank, Suit};
use crate::error::{PokerError, Result};
use serde::{Deserialize, Serialize};
use std::fmt;

/// A poker range — a set of possible hands.
///
/// Internally represented as a 1326-bit mask (one bit per hand combination).
/// This allows for O(1) set operations (union, intersection, difference).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct HandRange {
    /// Bit mask: bit (i * 52 + j) represents the hand [Card(i), Card(j)]
    /// where i < j. Only the lower triangle is used.
    /// For weighted ranges, we use a separate structure.
    mask: [u64; 21], // 21 * 64 = 1344 bits, covers all C(52,2) = 1326 combos
}

impl HandRange {
    /// Create an empty range.
    pub fn empty() -> Self {
        HandRange { mask: [0; 21] }
    }

    /// Create a full range (all 1326 combinations).
    pub fn full() -> Self {
        let mut range = Self::empty();
        // Set all 1326 bits
        for i in 0..20 {
            range.mask[i] = u64::MAX;
        }
        // Last word only needs lower bits
        range.mask[20] = (1u64 << 46) - 1; // 46 bits for combos 1280-1325
        range
    }

    /// Number of combinations in this range.
    pub fn count(&self) -> usize {
        self.mask.iter().map(|&w| w.count_ones() as usize).sum()
    }

    /// Percentage of all hands (1326).
    pub fn percent(&self) -> f64 {
        self.count() as f64 / 1326.0 * 100.0
    }

    /// Check if a specific hand is in the range.
    pub fn contains(&self, a: Card, b: Card) -> bool {
        let idx = Self::hand_index(a, b);
        let word = idx / 64;
        let bit = idx % 64;
        (self.mask[word] >> bit) & 1 == 1
    }

    /// Add a hand to the range.
    pub fn add(&mut self, a: Card, b: Card) {
        let idx = Self::hand_index(a, b);
        let word = idx / 64;
        let bit = idx % 64;
        self.mask[word] |= 1u64 << bit;
    }

    /// Remove a hand from the range.
    pub fn remove(&mut self, a: Card, b: Card) {
        let idx = Self::hand_index(a, b);
        let word = idx / 64;
        let bit = idx % 64;
        self.mask[word] &= !(1u64 << bit);
    }

    /// Union with another range.
    pub fn union(&self, other: &HandRange) -> HandRange {
        let mut result = Self::empty();
        for i in 0..21 {
            result.mask[i] = self.mask[i] | other.mask[i];
        }
        result
    }

    /// Intersection with another range.
    pub fn intersection(&self, other: &HandRange) -> HandRange {
        let mut result = Self::empty();
        for i in 0..21 {
            result.mask[i] = self.mask[i] & other.mask[i];
        }
        result
    }

    /// Difference (self - other).
    pub fn difference(&self, other: &HandRange) -> HandRange {
        let mut result = Self::empty();
        for i in 0..21 {
            result.mask[i] = self.mask[i] & !other.mask[i];
        }
        result
    }

    /// Complement (all hands not in this range).
    pub fn complement(&self) -> HandRange {
        let mut result = Self::empty();
        for i in 0..20 {
            result.mask[i] = !self.mask[i];
        }
        result.mask[20] = !self.mask[20] & ((1u64 << 46) - 1);
        result
    }

    /// Get all hands in this range.
    pub fn hands(&self) -> Vec<(Card, Card)> {
        let mut result = Vec::new();
        for word_idx in 0..21 {
            let word = self.mask[word_idx];
            if word == 0 {
                continue;
            }
            for bit in 0..64 {
                if word & (1u64 << bit) != 0 {
                    let idx = word_idx * 64 + bit;
                    if let Some((a, b)) = Self::index_to_hand(idx) {
                        result.push((a, b));
                    }
                }
            }
        }
        result
    }

    /// Parse a range from a string like "AA,AKs,AQo+,T5s-98s,JJ-TT".
    pub fn from_str(s: &str) -> Result<Self> {
        let mut range = Self::empty();
        
        for part in s.split(',') {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }
            
            // Check for range like "T5s-98s" or "JJ-TT"
            if part.contains('-') {
                let parts: Vec<&str> = part.split('-').collect();
                if parts.len() != 2 {
                    return Err(PokerError::InvalidRange(format!("invalid range segment: {}", part)));
                }
                let start = Self::parse_segment(parts[0])?;
                let end = Self::parse_segment(parts[1])?;
                range.add_segment_range(&start, &end)?;
            } else if part.ends_with('+') {
                // Plus notation: "AQo+" means AQo and all stronger offsuit hands
                let base = &part[..part.len() - 1];
                let seg = Self::parse_segment(base)?;
                range.add_plus_range(&seg)?;
            } else {
                // Single segment
                let seg = Self::parse_segment(part)?;
                range.add_segment(&seg)?;
            }
        }
        
        Ok(range)
    }

    // --- Private helpers ---

    fn hand_index(a: Card, b: Card) -> usize {
        let i = a.index() as usize;
        let j = b.index() as usize;
        // Ensure i < j
        let (low, high) = if i < j { (i, j) } else { (j, i) };
        // Map to triangular index: sum_{k=0}^{high-1} k + low = high*(high-1)/2 + low
        high * (high - 1) / 2 + low
    }

    fn index_to_hand(idx: usize) -> Option<(Card, Card)> {
        if idx >= 1326 {
            return None;
        }
        // Reverse triangular number
        let high = ((1 + 8 * idx) as f64).sqrt() as usize;
        let triangular = high * (high - 1) / 2;
        let low = idx - triangular;
        Some((Card::from_index(low as u8), Card::from_index(high as u8)))
    }

    fn parse_segment(s: &str) -> Result<RangeSegment> {
        let s = s.trim();
        if s.len() < 2 {
            return Err(PokerError::InvalidRange(format!("segment too short: {}", s)));
        }

        // Pocket pair: "AA", "KK"
        if s.len() == 2 && s.chars().nth(0) == s.chars().nth(1) {
            let rank = s[..1].parse::<Rank>()?;
            return Ok(RangeSegment::PocketPair(rank));
        }

        // Suited/offsuit: "AKs", "AKo"
        if s.len() == 3 {
            let r1 = s[..1].parse::<Rank>()?;
            let r2 = s[1..2].parse::<Rank>()?;
            let suffix = s.chars().nth(2).unwrap();
            match suffix {
                's' | 'S' => return Ok(RangeSegment::Suited(r1, r2)),
                'o' | 'O' => return Ok(RangeSegment::Offsuit(r1, r2)),
                _ => {}
            }
        }

        Err(PokerError::InvalidRange(format!("cannot parse segment: {}", s)))
    }

    fn add_segment(&mut self, seg: &RangeSegment) -> Result<()> {
        match seg {
            RangeSegment::PocketPair(rank) => {
                for suit1 in Suit::ALL {
                    for suit2 in Suit::ALL {
                        if suit1 != suit2 {
                            self.add(Card::new(*rank, suit1), Card::new(*rank, suit2));
                        }
                    }
                }
            }
            RangeSegment::Suited(r1, r2) => {
                for suit in Suit::ALL {
                    self.add(Card::new(*r1, suit), Card::new(*r2, suit));
                }
            }
            RangeSegment::Offsuit(r1, r2) => {
                for suit1 in Suit::ALL {
                    for suit2 in Suit::ALL {
                        if suit1 != suit2 {
                            self.add(Card::new(*r1, suit1), Card::new(*r2, suit2));
                        }
                    }
                }
            }
        }
        Ok(())
    }

    fn add_segment_range(&mut self, start: &RangeSegment, end: &RangeSegment) -> Result<()> {
        // TODO: Implement proper range expansion
        // For now, just add both endpoints
        self.add_segment(start)?;
        self.add_segment(end)?;
        Ok(())
    }

    fn add_plus_range(&mut self, seg: &RangeSegment) -> Result<()> {
        // TODO: Implement plus notation expansion
        self.add_segment(seg)?;
        Ok(())
    }
}

impl Default for HandRange {
    fn default() -> Self {
        Self::empty()
    }
}

impl fmt::Display for HandRange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} combos ({:.1}%)", self.count(), self.percent())
    }
}

/// Internal representation of a range segment.
#[derive(Debug, Clone)]
enum RangeSegment {
    PocketPair(Rank),
    Suited(Rank, Rank),
    Offsuit(Rank, Rank),
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::card::{Card, Rank, Suit};

    #[test]
    fn test_range_empty_full() {
        let empty = HandRange::empty();
        assert_eq!(empty.count(), 0);
        assert_eq!(empty.percent(), 0.0);

        let full = HandRange::full();
        assert_eq!(full.count(), 1326);
    }

    #[test]
    fn test_range_add_remove() {
        let mut range = HandRange::empty();
        let card1 = Card::new(Rank::Ace, Suit::Spades);
        let card2 = Card::new(Rank::King, Suit::Hearts);

        assert!(!range.contains(card1, card2));
        range.add(card1, card2);
        assert!(range.contains(card1, card2));
        range.remove(card1, card2);
        assert!(!range.contains(card1, card2));
    }

    #[test]
    fn test_range_pocket_pair() {
        let range = HandRange::from_str("AA").unwrap();
        assert_eq!(range.count(), 6); // C(4,2) = 6 combinations
    }

    #[test]
    fn test_range_suited() {
        let range = HandRange::from_str("AKs").unwrap();
        assert_eq!(range.count(), 4); // 4 suits
    }

    #[test]
    fn test_range_offsuit() {
        let range = HandRange::from_str("AKo").unwrap();
        assert_eq!(range.count(), 12); // 4 * 3 = 12 combinations
    }

    #[test]
    fn test_range_union_intersection() {
        let range1 = HandRange::from_str("AA").unwrap();
        let range2 = HandRange::from_str("KK").unwrap();

        let union = range1.union(&range2);
        assert_eq!(union.count(), 12);

        let intersection = range1.intersection(&range2);
        assert_eq!(intersection.count(), 0);
    }
}
