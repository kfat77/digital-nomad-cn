use crate::error::{PokerError, Result};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/// A playing card suit.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[repr(u8)]
pub enum Suit {
    Spades = 0,   // ♠
    Hearts = 1,   // ♥
    Diamonds = 2, // ♦
    Clubs = 3,    // ♣
}

impl Suit {
    pub const ALL: [Suit; 4] = [Suit::Spades, Suit::Hearts, Suit::Diamonds, Suit::Clubs];

    pub fn as_char(self) -> char {
        match self {
            Suit::Spades => 's',
            Suit::Hearts => 'h',
            Suit::Diamonds => 'd',
            Suit::Clubs => 'c',
        }
    }

    pub fn as_symbol(self) -> char {
        match self {
            Suit::Spades => '♠',
            Suit::Hearts => '♥',
            Suit::Diamonds => '♦',
            Suit::Clubs => '♣',
        }
    }

    pub fn is_red(self) -> bool {
        matches!(self, Suit::Hearts | Suit::Diamonds)
    }

    pub fn is_black(self) -> bool {
        matches!(self, Suit::Spades | Suit::Clubs)
    }

    pub fn index(self) -> usize {
        self as usize
    }
}

impl fmt::Display for Suit {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_char())
    }
}

impl FromStr for Suit {
    type Err = PokerError;

    fn from_str(s: &str) -> Result<Self> {
        match s.chars().next() {
            Some('s') | Some('S') | Some('♠') => Ok(Suit::Spades),
            Some('h') | Some('H') | Some('♥') => Ok(Suit::Hearts),
            Some('d') | Some('D') | Some('♦') => Ok(Suit::Diamonds),
            Some('c') | Some('C') | Some('♣') => Ok(Suit::Clubs),
            _ => Err(PokerError::InvalidSuit(s.to_string())),
        }
    }
}

/// A playing card rank.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[repr(u8)]
pub enum Rank {
    Two = 0,
    Three = 1,
    Four = 2,
    Five = 3,
    Six = 4,
    Seven = 5,
    Eight = 6,
    Nine = 7,
    Ten = 8,
    Jack = 9,
    Queen = 10,
    King = 11,
    Ace = 12,
}

impl Rank {
    pub const ALL: [Rank; 13] = [
        Rank::Two, Rank::Three, Rank::Four, Rank::Five,
        Rank::Six, Rank::Seven, Rank::Eight, Rank::Nine,
        Rank::Ten, Rank::Jack, Rank::Queen, Rank::King, Rank::Ace,
    ];

    pub fn as_char(self) -> char {
        match self {
            Rank::Two => '2',
            Rank::Three => '3',
            Rank::Four => '4',
            Rank::Five => '5',
            Rank::Six => '6',
            Rank::Seven => '7',
            Rank::Eight => '8',
            Rank::Nine => '9',
            Rank::Ten => 'T',
            Rank::Jack => 'J',
            Rank::Queen => 'Q',
            Rank::King => 'K',
            Rank::Ace => 'A',
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Rank::Two => "2",
            Rank::Three => "3",
            Rank::Four => "4",
            Rank::Five => "5",
            Rank::Six => "6",
            Rank::Seven => "7",
            Rank::Eight => "8",
            Rank::Nine => "9",
            Rank::Ten => "T",
            Rank::Jack => "J",
            Rank::Queen => "Q",
            Rank::King => "K",
            Rank::Ace => "A",
        }
    }

    pub fn index(self) -> usize {
        self as usize
    }

    pub fn next(self) -> Option<Rank> {
        match self {
            Rank::Two => Some(Rank::Three),
            Rank::Three => Some(Rank::Four),
            Rank::Four => Some(Rank::Five),
            Rank::Five => Some(Rank::Six),
            Rank::Six => Some(Rank::Seven),
            Rank::Seven => Some(Rank::Eight),
            Rank::Eight => Some(Rank::Nine),
            Rank::Nine => Some(Rank::Ten),
            Rank::Ten => Some(Rank::Jack),
            Rank::Jack => Some(Rank::Queen),
            Rank::Queen => Some(Rank::King),
            Rank::King => Some(Rank::Ace),
            Rank::Ace => None,
        }
    }

    pub fn prev(self) -> Option<Rank> {
        match self {
            Rank::Two => None,
            Rank::Three => Some(Rank::Two),
            Rank::Four => Some(Rank::Three),
            Rank::Five => Some(Rank::Four),
            Rank::Six => Some(Rank::Five),
            Rank::Seven => Some(Rank::Six),
            Rank::Eight => Some(Rank::Seven),
            Rank::Nine => Some(Rank::Eight),
            Rank::Ten => Some(Rank::Nine),
            Rank::Jack => Some(Rank::Ten),
            Rank::Queen => Some(Rank::Jack),
            Rank::King => Some(Rank::Queen),
            Rank::Ace => Some(Rank::King),
        }
    }
}

impl fmt::Display for Rank {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_char())
    }
}

impl FromStr for Rank {
    type Err = PokerError;

    fn from_str(s: &str) -> Result<Self> {
        match s.chars().next() {
            Some('2') => Ok(Rank::Two),
            Some('3') => Ok(Rank::Three),
            Some('4') => Ok(Rank::Four),
            Some('5') => Ok(Rank::Five),
            Some('6') => Ok(Rank::Six),
            Some('7') => Ok(Rank::Seven),
            Some('8') => Ok(Rank::Eight),
            Some('9') => Ok(Rank::Nine),
            Some('T') | Some('t') | Some('1') => Ok(Rank::Ten),
            Some('J') | Some('j') => Ok(Rank::Jack),
            Some('Q') | Some('q') => Ok(Rank::Queen),
            Some('K') | Some('k') => Ok(Rank::King),
            Some('A') | Some('a') => Ok(Rank::Ace),
            _ => Err(PokerError::InvalidRank(s.to_string())),
        }
    }
}

/// A single playing card.
///
/// Internally represented as a `u8` where:
/// - bits 0-3: suit index (0-3)
/// - bits 4-7: rank index (0-12)
///
/// This compact representation allows for efficient bit manipulation
/// in hand evaluation algorithms.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Card(u8);

impl Card {
    /// The total number of distinct cards in a standard deck.
    pub const COUNT: usize = 52;

    /// Create a new card from a rank and suit.
    #[inline]
    pub const fn new(rank: Rank, suit: Suit) -> Self {
        Card(((rank as u8) << 2) | (suit as u8))
    }

    /// Create a card from its internal index (0-51).
    ///
    /// Index ordering: all cards of rank Two (suits 0-3),
    /// then all Threes, etc.
    #[inline]
    pub const fn from_index(index: u8) -> Self {
        debug_assert!(index < 52);
        Card(index)
    }

    /// Get the rank of this card.
    #[inline]
    pub const fn rank(self) -> Rank {
        // SAFETY: rank bits are always 0-12
        unsafe { std::mem::transmute((self.0 >> 2) & 0x0F) }
    }

    /// Get the suit of this card.
    #[inline]
    pub const fn suit(self) -> Suit {
        // SAFETY: suit bits are always 0-3
        unsafe { std::mem::transmute(self.0 & 0x03) }
    }

    /// Get the internal index (0-51).
    #[inline]
    pub const fn index(self) -> u8 {
        self.0
    }

    /// Get a bit mask representation (1 << index).
    #[inline]
    pub const fn bit(self) -> u64 {
        1u64 << (self.0 as u64)
    }

    /// Parse a card from a string like "As", "Kh", "Td", "2c".
    pub fn from_str(s: &str) -> Result<Self> {
        let s = s.trim();
        if s.len() < 2 {
            return Err(PokerError::InvalidCardString(s.to_string()));
        }

        let rank = s[..s.len() - 1].parse::<Rank>()?;
        let suit = s[s.len() - 1..].parse::<Suit>()?;
        Ok(Card::new(rank, suit))
    }

    /// Parse multiple cards from a string like "AsKh" or "As Kh Td".
    pub fn parse_many(s: &str) -> Result<Vec<Card>> {
        let s = s.trim().replace(' ', "");
        if s.is_empty() {
            return Ok(Vec::new());
        }

        let mut cards = Vec::new();
        let chars: Vec<char> = s.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            let rank_char = chars[i];
            i += 1;
            if i >= chars.len() {
                return Err(PokerError::InvalidCardString(s));
            }
            let suit_char = chars[i];
            i += 1;

            let rank_str = rank_char.to_string();
            let suit_str = suit_char.to_string();

            let rank = rank_str.parse::<Rank>()?;
            let suit = suit_str.parse::<Suit>()?;
            cards.push(Card::new(rank, suit));
        }

        Ok(cards)
    }

    /// Check if two cards form a suited hand.
    pub fn is_suited(a: Card, b: Card) -> bool {
        a.suit() == b.suit()
    }

    /// Check if two cards form a pocket pair.
    pub fn is_pocket_pair(a: Card, b: Card) -> bool {
        a.rank() == b.rank()
    }

    /// Check if two cards are connected (consecutive ranks).
    pub fn is_connected(a: Card, b: Card) -> bool {
        let diff = (a.rank().index() as i8 - b.rank().index() as i8).abs();
        diff == 1
    }
}

impl fmt::Debug for Card {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Card({}{}{})", self.rank(), self.suit().as_symbol(), self.suit().as_char())
    }
}

impl fmt::Display for Card {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}{}", self.rank(), self.suit())
    }
}

impl FromStr for Card {
    type Err = PokerError;

    fn from_str(s: &str) -> Result<Self> {
        Card::from_str(s)
    }
}

/// A standard 52-card deck.
#[derive(Debug, Clone)]
pub struct Deck {
    cards: Vec<Card>,
    current: usize,
}

impl Deck {
    /// Create a new shuffled deck.
    pub fn new() -> Self {
        let mut cards = Vec::with_capacity(52);
        for rank in Rank::ALL {
            for suit in Suit::ALL {
                cards.push(Card::new(rank, suit));
            }
        }
        Deck { cards, current: 0 }
    }

    /// Create a new deck without shuffling (ordered).
    pub fn new_ordered() -> Self {
        Self::new()
    }

    /// Shuffle the deck using the provided RNG.
    pub fn shuffle<R: rand::Rng>(&mut self, rng: &mut R) {
        use rand::seq::SliceRandom;
        self.cards.shuffle(rng);
        self.current = 0;
    }

    /// Deal a single card from the top of the deck.
    pub fn deal(&mut self) -> Option<Card> {
        if self.current < self.cards.len() {
            let card = self.cards[self.current];
            self.current += 1;
            Some(card)
        } else {
            None
        }
    }

    /// Deal multiple cards.
    pub fn deal_many(&mut self, count: usize) -> Vec<Card> {
        let mut dealt = Vec::with_capacity(count);
        for _ in 0..count {
            if let Some(card) = self.deal() {
                dealt.push(card);
            } else {
                break;
            }
        }
        dealt
    }

    /// Remove specific cards from the deck (e.g., known hole cards).
    pub fn remove_cards(&mut self, cards: &[Card]) {
        let remove_set: std::collections::HashSet<u8> = cards.iter().map(|c| c.index()).collect();
        self.cards.retain(|c| !remove_set.contains(&c.index()));
    }

    /// Number of cards remaining in the deck.
    pub fn remaining(&self) -> usize {
        self.cards.len() - self.current
    }

    /// Reset the deck to its full 52-card state.
    pub fn reset(&mut self) {
        *self = Self::new();
    }
}

impl Default for Deck {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_card_creation() {
        let card = Card::new(Rank::Ace, Suit::Spades);
        assert_eq!(card.rank(), Rank::Ace);
        assert_eq!(card.suit(), Suit::Spades);
        assert_eq!(card.index(), Card::new(Rank::Ace, Suit::Spades).index());
    }

    #[test]
    fn test_card_parse() {
        let card = Card::from_str("As").unwrap();
        assert_eq!(card.rank(), Rank::Ace);
        assert_eq!(card.suit(), Suit::Spades);

        let card = Card::from_str("Td").unwrap();
        assert_eq!(card.rank(), Rank::Ten);
        assert_eq!(card.suit(), Suit::Diamonds);
    }

    #[test]
    fn test_card_parse_many() {
        let cards = Card::parse_many("AsKhTd2c").unwrap();
        assert_eq!(cards.len(), 4);
        assert_eq!(cards[0], Card::new(Rank::Ace, Suit::Spades));
        assert_eq!(cards[1], Card::new(Rank::King, Suit::Hearts));
        assert_eq!(cards[2], Card::new(Rank::Ten, Suit::Diamonds));
        assert_eq!(cards[3], Card::new(Rank::Two, Suit::Clubs));
    }

    #[test]
    fn test_suit_properties() {
        assert!(Suit::Hearts.is_red());
        assert!(!Suit::Spades.is_red());
        assert!(Suit::Spades.is_black());
        assert!(!Suit::Hearts.is_black());
    }

    #[test]
    fn test_rank_ordering() {
        assert!(Rank::Ace > Rank::King);
        assert!(Rank::King > Rank::Queen);
        assert!(Rank::Two < Rank::Three);
    }

    #[test]
    fn test_card_ordering() {
        let ace_spades = Card::new(Rank::Ace, Suit::Spades);
        let king_hearts = Card::new(Rank::King, Suit::Hearts);
        assert!(ace_spades > king_hearts);
    }

    #[test]
    fn test_deck() {
        let mut deck = Deck::new_ordered();
        assert_eq!(deck.remaining(), 52);

        let card = deck.deal().unwrap();
        assert_eq!(deck.remaining(), 51);
        assert_eq!(card, Card::new(Rank::Two, Suit::Spades));

        deck.remove_cards(&[Card::new(Rank::Ace, Suit::Spades)]);
        assert_eq!(deck.remaining(), 50);
    }

    #[test]
    fn test_card_display() {
        assert_eq!(Card::new(Rank::Ace, Suit::Spades).to_string(), "As");
        assert_eq!(Card::new(Rank::Ten, Suit::Hearts).to_string(), "Th");
        assert_eq!(Card::new(Rank::Two, Suit::Clubs).to_string(), "2c");
    }
}
