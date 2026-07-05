use crate::card::Card;
use crate::error::{PokerError, Result};
use serde::{Deserialize, Serialize};
use std::fmt;

/// The category of a poker hand, from weakest to strongest.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[repr(u8)]
pub enum HandCategory {
    HighCard = 0,
    OnePair = 1,
    TwoPair = 2,
    ThreeOfAKind = 3,
    Straight = 4,
    Flush = 5,
    FullHouse = 6,
    FourOfAKind = 7,
    StraightFlush = 8,
}

impl HandCategory {
    pub fn as_str(self) -> &'static str {
        match self {
            HandCategory::HighCard => "High Card",
            HandCategory::OnePair => "One Pair",
            HandCategory::TwoPair => "Two Pair",
            HandCategory::ThreeOfAKind => "Three of a Kind",
            HandCategory::Straight => "Straight",
            HandCategory::Flush => "Flush",
            HandCategory::FullHouse => "Full House",
            HandCategory::FourOfAKind => "Four of a Kind",
            HandCategory::StraightFlush => "Straight Flush",
        }
    }
}

impl fmt::Display for HandCategory {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// A complete hand ranking, including category and kickers.
///
/// The ranking value is a 16-bit integer where:
/// - bits 12-15: hand category (0-8)
/// - bits 0-11: kickers (varies by category)
///
/// Higher value = stronger hand.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct HandRanking(pub u16);

impl HandRanking {
    pub fn category(self) -> HandCategory {
        let cat = (self.0 >> 12) & 0x0F;
        // SAFETY: cat is always 0-8
        unsafe { std::mem::transmute(cat as u8) }
    }

    pub fn value(self) -> u16 {
        self.0
    }
}

impl fmt::Display for HandRanking {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} ({})", self.category(), self.0)
    }
}

/// A poker hand — a collection of cards.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Hand {
    cards: Vec<Card>,
}

impl Hand {
    /// Create a new hand from a vector of cards.
    pub fn new(cards: Vec<Card>) -> Result<Self> {
        if cards.is_empty() {
            return Err(PokerError::InvalidHand("hand cannot be empty".to_string()));
        }
        if cards.len() > 7 {
            return Err(PokerError::TooManyCards {
                max: 7,
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

        Ok(Hand { cards })
    }

    /// Create a hand from a string like "AsKh" or "As Kh Td Jc 2h".
    pub fn from_str(s: &str) -> Result<Self> {
        let cards = Card::parse_many(s)?;
        Self::new(cards)
    }

    /// Get the cards in this hand.
    pub fn cards(&self) -> &[Card] {
        &self.cards
    }

    /// Number of cards in the hand.
    pub fn len(&self) -> usize {
        self.cards.len()
    }

    pub fn is_empty(&self) -> bool {
        self.cards.is_empty()
    }

    /// Check if this is a valid 5-card hand.
    pub fn is_5card(&self) -> bool {
        self.cards.len() == 5
    }

    /// Check if this is a valid 7-card hand (e.g., Texas Hold'em).
    pub fn is_7card(&self) -> bool {
        self.cards.len() == 7
    }

    /// Check if this is a valid 2-card hand (hole cards).
    pub fn is_hole_cards(&self) -> bool {
        self.cards.len() == 2
    }

    /// Get the best 5-card hand from these cards.
    /// For 5 cards, returns a clone.
    /// For 6-7 cards, evaluates all C(n,5) combinations.
    pub fn best_5card(&self) -> Result<Hand> {
        match self.cards.len() {
            5 => Ok(self.clone()),
            6 | 7 => {
                // TODO: This requires the evaluator — will be implemented in poker-eval crate
                // For now, return the first 5 cards
                Ok(Hand::new(self.cards[..5].to_vec())?)
            }
            _ => Err(PokerError::InvalidHand(
                format!("cannot extract best 5-card hand from {} cards", self.cards.len())
            )),
        }
    }
}

impl fmt::Display for Hand {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let cards_str: Vec<String> = self.cards.iter().map(|c| c.to_string()).collect();
        write!(f, "[{}]", cards_str.join(" "))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hand_creation() {
        let hand = Hand::from_str("AsKh").unwrap();
        assert_eq!(hand.len(), 2);
        assert!(hand.is_hole_cards());
    }

    #[test]
    fn test_hand_duplicate_error() {
        let result = Hand::from_str("AsAs");
        assert!(result.is_err());
    }

    #[test]
    fn test_hand_category_order() {
        assert!(HandCategory::StraightFlush > HandCategory::FourOfAKind);
        assert!(HandCategory::FullHouse > HandCategory::Flush);
        assert!(HandCategory::HighCard < HandCategory::OnePair);
    }
}
