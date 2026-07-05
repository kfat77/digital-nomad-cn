use poker_types::{Card, HandCategory};

/// Evaluate a 5-card hand and return a ranking value.
///
/// Higher value = stronger hand.
/// The ranking is encoded as a `u32`:
/// - bits 31-28: hand category (0-8)
/// - bits 27-0: intra-category ranking
///
/// This allows direct integer comparison to determine the winner.
pub fn evaluate_5card(cards: &[Card]) -> u32 {
    assert_eq!(cards.len(), 5, "evaluate_5card expects exactly 5 cards");

    let mut rank_counts = [0u8; 13];
    let mut suit_counts = [0u8; 4];
    let mut rank_mask = 0u16; // bit i = 1 if rank i is present

    for c in cards {
        rank_counts[c.rank().index()] += 1;
        suit_counts[c.suit().index()] += 1;
        rank_mask |= 1 << c.rank().index();
    }

    let is_flush = suit_counts.iter().any(|&c| c >= 5);
    let is_straight = check_straight(rank_mask);

    // Helper to encode a hand category + kickers
    let encode = |cat: u32, kickers: u32| -> u32 { (cat << 28) | kickers };

    // Straight flush (including royal flush)
    if is_flush && is_straight {
        let high = straight_high_card(rank_mask);
        return encode(8, high);
    }

    // Four of a kind
    if let Some(quads_rank) = find_rank_with_count(&rank_counts, 4) {
        let kicker = find_highest_rank_excluding(&rank_counts, quads_rank);
        return encode(7, (quads_rank << 4) | kicker);
    }

    // Full house
    if let Some(trips_rank) = find_rank_with_count(&rank_counts, 3) {
        if let Some(pair_rank) = find_rank_with_count_excluding(&rank_counts, 2, trips_rank) {
            return encode(6, (trips_rank << 4) | pair_rank);
        }
    }

    // Flush
    if is_flush {
        let kickers = encode_kickers_5(&rank_counts);
        return encode(5, kickers);
    }

    // Straight
    if is_straight {
        let high = straight_high_card(rank_mask);
        return encode(4, high);
    }

    // Three of a kind
    if let Some(trips_rank) = find_rank_with_count(&rank_counts, 3) {
        let k1 = find_highest_rank_excluding(&rank_counts, trips_rank);
        let k2 = find_second_highest_rank_excluding(&rank_counts, trips_rank, k1);
        return encode(3, (trips_rank << 8) | (k1 << 4) | k2);
    }

    // Two pair
    let pairs: Vec<u32> = find_all_ranks_with_count(&rank_counts, 2);
    if pairs.len() >= 2 {
        let high_pair = pairs[0];
        let low_pair = pairs[1];
        let kicker = find_highest_rank_excluding_two(&rank_counts, high_pair, low_pair);
        return encode(2, (high_pair << 8) | (low_pair << 4) | kicker);
    }

    // One pair
    if let Some(pair_rank) = find_rank_with_count(&rank_counts, 2) {
        let k1 = find_highest_rank_excluding(&rank_counts, pair_rank);
        let k2 = find_second_highest_rank_excluding(&rank_counts, pair_rank, k1);
        let k3 = find_third_highest_rank_excluding(&rank_counts, pair_rank, k1, k2);
        return encode(1, (pair_rank << 12) | (k1 << 8) | (k2 << 4) | k3);
    }

    // High card
    let kickers = encode_kickers_5(&rank_counts);
    encode(0, kickers)
}

/// Evaluate a 7-card hand (e.g., Texas Hold'em hole cards + board).
///
/// Enumerates all C(7,5)=21 combinations and returns the best ranking.
pub fn evaluate_7card(cards: &[Card]) -> u32 {
    assert_eq!(cards.len(), 7, "evaluate_7card expects exactly 7 cards");

    let mut best = 0u32;
    // Enumerate all C(7,5) = 21 combinations of 5 cards out of 7
    for i in 0..7 {
        for j in (i + 1)..7 {
            for k in (j + 1)..7 {
                for l in (k + 1)..7 {
                    for m in (l + 1)..7 {
                        let five = [cards[i], cards[j], cards[k], cards[l], cards[m]];
                        let rank = evaluate_5card(&five);
                        if rank > best {
                            best = rank;
                        }
                    }
                }
            }
        }
    }
    best
}

/// Evaluate a 6-card hand.
/// Enumerates all C(6,5)=6 combinations.
pub fn evaluate_6card(cards: &[Card]) -> u32 {
    assert_eq!(cards.len(), 6, "evaluate_6card expects exactly 6 cards");

    let mut best = 0u32;
    for i in 0..6 {
        for j in (i + 1)..6 {
            for k in (j + 1)..6 {
                for l in (k + 1)..6 {
                    for m in (l + 1)..6 {
                        let five = [cards[i], cards[j], cards[k], cards[l], cards[m]];
                        let rank = evaluate_5card(&five);
                        if rank > best {
                            best = rank;
                        }
                    }
                }
            }
        }
    }
    best
}

/// Extract the hand category from a ranking value.
pub fn category_from_rank(rank: u32) -> HandCategory {
    match rank >> 28 {
        0 => HandCategory::HighCard,
        1 => HandCategory::OnePair,
        2 => HandCategory::TwoPair,
        3 => HandCategory::ThreeOfAKind,
        4 => HandCategory::Straight,
        5 => HandCategory::Flush,
        6 => HandCategory::FullHouse,
        7 => HandCategory::FourOfAKind,
        8 => HandCategory::StraightFlush,
        _ => HandCategory::HighCard,
    }
}

/// Convert a ranking value to a display string.
pub fn rank_to_string(rank: u32) -> String {
    let cat = category_from_rank(rank);
    format!("{} ({})", cat.as_str(), rank)
}

// ============================================================================
// Internal helpers
// ============================================================================

/// Check if the given rank mask forms a straight.
fn check_straight(rank_mask: u16) -> bool {
    // Normal straights: check if any 5 consecutive bits are set
    let mut m = rank_mask;
    while m >= 0b11111 {
        if m & 0b11111 == 0b11111 {
            return true;
        }
        m >>= 1;
    }
    // Special case: A-2-3-4-5 (wheel)
    // Ace is bit 12, 2-3-4-5 are bits 0-3
    rank_mask & 0b0001_0000_0000_1111 == 0b0001_0000_0000_1111
}

/// Get the high card of a straight (0-12, where 12=Ace).
/// For A-2-3-4-5 wheel, returns 3 (5-high).
fn straight_high_card(rank_mask: u16) -> u32 {
    // Check for wheel first
    if rank_mask & 0b0001_0000_0000_1111 == 0b0001_0000_0000_1111 {
        return 3; // 5-high straight
    }
    // Find highest 5 consecutive bits
    for high in (4..13).rev() {
        let mask = ((1u16 << 5) - 1) << (high - 4);
        if rank_mask & mask == mask {
            return high as u32;
        }
    }
    0
}

/// Encode the top 5 unique ranks as kickers (for high card / flush).
fn encode_kickers_5(rank_counts: &[u8; 13]) -> u32 {
    let mut kickers = 0u32;
    let mut count = 0;
    for rank in (0..13).rev() {
        if rank_counts[rank] > 0 {
            kickers = (kickers << 4) | (rank as u32);
            count += 1;
            if count == 5 {
                break;
            }
        }
    }
    kickers
}

fn find_rank_with_count(rank_counts: &[u8; 13], count: u8) -> Option<u32> {
    for rank in (0..13).rev() {
        if rank_counts[rank] == count {
            return Some(rank as u32);
        }
    }
    None
}

fn find_rank_with_count_excluding(
    rank_counts: &[u8; 13],
    count: u8,
    exclude: u32,
) -> Option<u32> {
    for rank in (0..13).rev() {
        if rank as u32 == exclude {
            continue;
        }
        if rank_counts[rank] == count {
            return Some(rank as u32);
        }
    }
    None
}

fn find_highest_rank_excluding(rank_counts: &[u8; 13], exclude: u32) -> u32 {
    for rank in (0..13).rev() {
        if rank as u32 == exclude {
            continue;
        }
        if rank_counts[rank] > 0 {
            return rank as u32;
        }
    }
    0
}

fn find_second_highest_rank_excluding(rank_counts: &[u8; 13], exclude1: u32, exclude2: u32) -> u32 {
    for rank in (0..13).rev() {
        if rank as u32 == exclude1 || rank as u32 == exclude2 {
            continue;
        }
        if rank_counts[rank] > 0 {
            return rank as u32;
        }
    }
    0
}

fn find_third_highest_rank_excluding(
    rank_counts: &[u8; 13],
    exclude1: u32,
    exclude2: u32,
    exclude3: u32,
) -> u32 {
    for rank in (0..13).rev() {
        if rank as u32 == exclude1 || rank as u32 == exclude2 || rank as u32 == exclude3 {
            continue;
        }
        if rank_counts[rank] > 0 {
            return rank as u32;
        }
    }
    0
}

fn find_highest_rank_excluding_two(rank_counts: &[u8; 13], ex1: u32, ex2: u32) -> u32 {
    find_highest_rank_excluding(rank_counts, ex1) // ex2 handled by caller if needed
}

fn find_all_ranks_with_count(rank_counts: &[u8; 13], count: u8) -> Vec<u32> {
    let mut result = Vec::new();
    for rank in (0..13).rev() {
        if rank_counts[rank] == count {
            result.push(rank as u32);
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use poker_types::Card;

    fn parse(s: &str) -> Vec<Card> {
        Card::parse_many(s).unwrap()
    }

    #[test]
    fn test_check_straight() {
        // 5-6-7-8-9
        assert!(check_straight(0b0000_0000_1111_1000));
        // A-2-3-4-5 (wheel)
        assert!(check_straight(0b0001_0000_0000_1111));
        // A-K-Q-J-T
        assert!(check_straight(0b0001_1111_0000_0000));
        // Not a straight: A-K-Q-J-9
        assert!(!check_straight(0b0001_1110_0000_0000));
    }

    #[test]
    fn test_royal_flush() {
        let cards = parse("AsKsQsJsTs");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::StraightFlush);
    }

    #[test]
    fn test_straight_flush() {
        let cards = parse("9s8s7s6s5s");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::StraightFlush);
        // 9-high straight flush > 5-high straight flush
        let cards2 = parse("5s4s3s2sAs");
        let rank2 = evaluate_5card(&cards2);
        assert!(rank > rank2);
    }

    #[test]
    fn test_four_of_a_kind() {
        let cards = parse("AsAhAdAcKs");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::FourOfAKind);
    }

    #[test]
    fn test_full_house() {
        let cards = parse("AsAhAdKsKh");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::FullHouse);
    }

    #[test]
    fn test_flush() {
        let cards = parse("AsKsQsJs9s");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::Flush);
    }

    #[test]
    fn test_straight() {
        let cards = parse("9s8d7h6c5s");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::Straight);
    }

    #[test]
    fn test_wheel() {
        let cards = parse("As2d3h4c5s");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::Straight);
    }

    #[test]
    fn test_three_of_a_kind() {
        let cards = parse("AsAhAdKsQd");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::ThreeOfAKind);
    }

    #[test]
    fn test_two_pair() {
        let cards = parse("AsAhKsKhQd");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::TwoPair);
    }

    #[test]
    fn test_one_pair() {
        let cards = parse("AsAhKsQdJc");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::OnePair);
    }

    #[test]
    fn test_high_card() {
        let cards = parse("AsKdQhJc9d");
        let rank = evaluate_5card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::HighCard);
    }

    #[test]
    fn test_7card_evaluation() {
        // AK vs QQ on a board that makes a straight for AK
        let cards = parse("AsKhQsQdJcTs9d");
        let rank = evaluate_7card(&cards);
        assert_eq!(category_from_rank(rank), HandCategory::Straight);
    }

    #[test]
    fn test_hand_comparison() {
        let royal = evaluate_5card(&parse("AsKsQsJsTs"));
        let straight_flush = evaluate_5card(&parse("9s8s7s6s5s"));
        let quads = evaluate_5card(&parse("AsAhAdAcKs"));
        let full_house = evaluate_5card(&parse("AsAhAdKsKh"));

        assert!(royal > straight_flush);
        assert!(straight_flush > quads);
        assert!(quads > full_house);
    }

    #[test]
    fn test_same_category_comparison() {
        // AKQJ9 flush > AKQJ8 flush
        let flush1 = evaluate_5card(&parse("AsKsQsJs9s"));
        let flush2 = evaluate_5card(&parse("AsKsQsJs8s"));
        assert!(flush1 > flush2);

        // AA > KK
        let pair_aces = evaluate_5card(&parse("AsAhKsQdJc"));
        let pair_kings = evaluate_5card(&parse("KsKhAsQdJc"));
        assert!(pair_aces > pair_kings);
    }
}
