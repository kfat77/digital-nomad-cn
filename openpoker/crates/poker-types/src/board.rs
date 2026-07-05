use crate::card::Card;
use crate::error::{PokerError, Result};
use crate::hand::Hand;
use serde::{Deserialize, Serialize};
use std::fmt;

/// Community cards on the board.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Board {
    cards: Vec<Card>,
}

impl Board {
    /// Create an empty board.
    pub fn new() -> Self {
        Board { cards: Vec::new() }
    }

    /// Create a board from a string like "Ts9d2h" or "Ts 9d 2h Jh Qc".
    pub fn from_str(s: &str) -> Result<Self> {
        let cards = Card::parse_many(s)?;
        Self::from_cards(cards)
    }

    /// Create a board from pre-parsed cards.
    pub fn from_cards(cards: Vec<Card>) -> Result<Self> {
        if cards.len() > 5 {
            return Err(PokerError::TooManyCards {
                max: 5,
                got: cards.len(),
            });
        }

        // Check for duplicates
        let mut seen = [false; 52];
        for card in &cards {
            let idx = card.index() as usize;
            if seen[idx] {
                return Err(PokerError::DuplicateCard(card.to_string()));
            }
            seen[idx] = true;
        }

        Ok(Board { cards })
    }

    /// Add a card to the board.
    pub fn add_card(&mut self, card: Card) -> Result<()> {
        if self.cards.len() >= 5 {
            return Err(PokerError::TooManyCards {
                max: 5,
                got: self.cards.len() + 1,
            });
        }

        for existing in &self.cards {
            if existing.index() == card.index() {
                return Err(PokerError::DuplicateCard(card.to_string()));
            }
        }

        self.cards.push(card);
        Ok(())
    }

    /// Get the cards on the board.
    pub fn cards(&self) -> &[Card] {
        &self.cards
    }

    /// Number of cards on the board.
    pub fn len(&self) -> usize {
        self.cards.len()
    }

    pub fn is_empty(&self) -> bool {
        self.cards.is_empty()
    }

    /// Check if the board is at pre-flop (0 cards).
    pub fn is_preflop(&self) -> bool {
        self.cards.is_empty()
    }

    /// Check if the board is at flop (3 cards).
    pub fn is_flop(&self) -> bool {
        self.cards.len() == 3
    }

    /// Check if the board is at turn (4 cards).
    pub fn is_turn(&self) -> bool {
        self.cards.len() == 4
    }

    /// Check if the board is at river (5 cards).
    pub fn is_river(&self) -> bool {
        self.cards.len() == 5
    }

    /// Get the current street name.
    pub fn street_name(&self) -> &'static str {
        match self.cards.len() {
            0 => "Pre-flop",
            3 => "Flop",
            4 => "Turn",
            5 => "River",
            _ => "Unknown",
        }
    }

    /// Combine hole cards with the board to form a 7-card hand.
    pub fn combine(&self, hole_cards: &[Card]) -> Result<Hand> {
        let mut all_cards = hole_cards.to_vec();
        all_cards.extend_from_slice(&self.cards);
        Hand::new(all_cards)
    }

    /// Check if the board has a pair (at least two cards of the same rank).
    pub fn has_pair(&self) -> bool {
        let mut rank_counts = [0u8; 13];
        for card in &self.cards {
            rank_counts[card.rank().index()] += 1;
        }
        rank_counts.iter().any(|&c| c >= 2)
    }

    /// Check if the board is paired (exactly one pair).
    pub fn is_paired(&self) -> bool {
        let mut rank_counts = [0u8; 13];
        for card in &self.cards {
            rank_counts[card.rank().index()] += 1;
        }
        rank_counts.iter().filter(|&&c| c >= 2).count() == 1
            && !rank_counts.iter().any(|&c| c >= 3)
    }

    /// Check if the board has three of a kind.
    pub fn has_trips(&self) -> bool {
        let mut rank_counts = [0u8; 13];
        for card in &self.cards {
            rank_counts[card.rank().index()] += 1;
        }
        rank_counts.iter().any(|&c| c >= 3)
    }

    /// Check if the board has two pair.
    pub fn is_two_pair_board(&self) -> bool {
        let mut rank_counts = [0u8; 13];
        for card in &self.cards {
            rank_counts[card.rank().index()] += 1;
        }
        rank_counts.iter().filter(|&&c| c >= 2).count() == 2
    }

    /// Check if the board is monotone (all cards same suit).
    pub fn is_monotone(&self) -> bool {
        if self.cards.len() < 3 {
            return false;
        }
        let first_suit = self.cards[0].suit();
        self.cards.iter().all(|c| c.suit() == first_suit)
    }

    /// Check if the board is rainbow (all cards different suits).
    pub fn is_rainbow(&self) -> bool {
        if self.cards.len() < 3 {
            return false;
        }
        let mut suits = [false; 4];
        for card in &self.cards {
            if suits[card.suit().index()] {
                return false;
            }
            suits[card.suit().index()] = true;
        }
        true
    }

    /// Check if the board is coordinated (connected or suited).
    pub fn is_coordinated(&self) -> bool {
        self.is_monotone() || self.has_straight_draw()
    }

    /// Check if the board has a straight draw (open-ended or gutshot).
    pub fn has_straight_draw(&self) -> bool {
        if self.cards.len() < 3 {
            return false;
        }
        let mut ranks: Vec<usize> = self.cards.iter().map(|c| c.rank().index()).collect();
        ranks.sort_unstable();
        ranks.dedup();

        // Check for any 4 consecutive ranks (open-ended)
        for window in ranks.windows(4) {
            if window[3] - window[0] == 3 {
                return true;
            }
        }

        // Check for 3 consecutive ranks (e.g. 7-8-9 -> can make straight with 6 or T)
        if ranks.len() >= 3 {
            for i in 0..ranks.len() - 2 {
                if ranks[i + 2] - ranks[i] == 2 {
                    return true;
                }
            }
        }

        // Check for gutshot (3 cards with 1 gap, e.g. 7-9-T needs 8)
        if ranks.len() >= 3 {
            for i in 0..ranks.len() - 2 {
                if ranks[i + 2] - ranks[i] == 3 {
                    return true;
                }
            }
        }

        // Wheel draw (A-2-3 or A-2-3-4)
        let has_ace = ranks.contains(&12); // Ace
        let has_2 = ranks.contains(&0);
        let has_3 = ranks.contains(&1);
        let has_4 = ranks.contains(&2);
        let has_5 = ranks.contains(&3);

        if has_ace && has_2 && has_3 {
            return true;
        }
        if has_ace && has_2 && has_3 && has_4 {
            return true;
        }
        if has_ace && has_2 && has_3 && has_4 && has_5 {
            return true;
        }

        false
    }
}

impl Default for Board {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for Board {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let cards_str: Vec<String> = self.cards.iter().map(|c| c.to_string()).collect();
        write!(f, "{}", cards_str.join(" "))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::card::{Card, Rank, Suit};

    #[test]
    fn test_board_streets() {
        let mut board = Board::new();
        assert!(board.is_preflop());
        assert_eq!(board.street_name(), "Pre-flop");

        board.add_card(Card::new(Rank::Ten, Suit::Spades)).unwrap();
        board.add_card(Card::new(Rank::Nine, Suit::Diamonds)).unwrap();
        board.add_card(Card::new(Rank::Two, Suit::Hearts)).unwrap();
        assert!(board.is_flop());
        assert_eq!(board.street_name(), "Flop");

        board.add_card(Card::new(Rank::King, Suit::Clubs)).unwrap();
        assert!(board.is_turn());
    }

    #[test]
    fn test_board_texture() {
        let board = Board::from_str("Ts9s2s").unwrap();
        assert!(board.is_monotone());
        assert!(!board.is_rainbow());
        assert!(board.is_coordinated());

        let board2 = Board::from_str("Ts9d2h").unwrap();
        assert!(!board2.is_monotone());
        assert!(board2.is_rainbow());

        let board3 = Board::from_str("TsTd2h").unwrap();
        assert!(board3.is_paired());
        assert!(board3.has_pair());
    }

    #[test]
    fn test_board_combine() {
        let board = Board::from_str("Ts9d2h").unwrap();
        let hole = vec![Card::new(Rank::Ace, Suit::Spades), Card::new(Rank::King, Suit::Hearts)];
        let hand = board.combine(&hole).unwrap();
        assert_eq!(hand.len(), 5);
    }

    #[test]
    fn test_board_straight_draw() {
        let board = Board::from_str("9s8d7h").unwrap();
        assert!(board.has_straight_draw()); // 3 consecutive -> open-ended potential

        let board2 = Board::from_str("As2s3d").unwrap();
        assert!(board2.has_straight_draw()); // wheel draw

        let board3 = Board::from_str("9s8d6h").unwrap();
        assert!(board3.has_straight_draw()); // gutshot (needs 7)
    }
}
