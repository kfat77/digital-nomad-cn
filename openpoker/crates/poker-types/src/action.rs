use crate::error::{PokerError, Result};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/// A poker action.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum Action {
    Fold,
    Check,
    Call,
    Bet { amount: f64 },
    Raise { amount: f64 },
    AllIn,
}

impl Action {
    pub fn as_str(self) -> &'static str {
        match self {
            Action::Fold => "Fold",
            Action::Check => "Check",
            Action::Call => "Call",
            Action::Bet { .. } => "Bet",
            Action::Raise { .. } => "Raise",
            Action::AllIn => "All-in",
        }
    }

    pub fn is_aggressive(self) -> bool {
        matches!(self, Action::Bet { .. } | Action::Raise { .. } | Action::AllIn)
    }

    pub fn is_passive(self) -> bool {
        matches!(self, Action::Check | Action::Call)
    }

    pub fn amount(&self) -> Option<f64> {
        match self {
            Action::Bet { amount } | Action::Raise { amount } => Some(*amount),
            _ => None,
        }
    }
}

impl fmt::Display for Action {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Action::Bet { amount } => write!(f, "Bet {}", amount),
            Action::Raise { amount } => write!(f, "Raise {}", amount),
            _ => write!(f, "{}", self.as_str()),
        }
    }
}

/// A street action — a specific action taken by a specific player on a specific street.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StreetAction {
    pub player_name: String,
    pub action: Action,
    pub street: Street,
}

/// The betting street.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Street {
    Preflop,
    Flop,
    Turn,
    River,
    Showdown,
}

impl Street {
    pub fn as_str(self) -> &'static str {
        match self {
            Street::Preflop => "Pre-flop",
            Street::Flop => "Flop",
            Street::Turn => "Turn",
            Street::River => "River",
            Street::Showdown => "Showdown",
        }
    }

    pub fn next(self) -> Option<Street> {
        match self {
            Street::Preflop => Some(Street::Flop),
            Street::Flop => Some(Street::Turn),
            Street::Turn => Some(Street::River),
            Street::River => Some(Street::Showdown),
            Street::Showdown => None,
        }
    }

    pub fn num_cards(self) -> usize {
        match self {
            Street::Preflop => 0,
            Street::Flop => 3,
            Street::Turn => 4,
            Street::River => 5,
            Street::Showdown => 5,
        }
    }
}

impl fmt::Display for Street {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Betting structure of a poker game.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BettingStructure {
    NoLimit,
    PotLimit,
    FixedLimit,
}

impl fmt::Display for BettingStructure {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BettingStructure::NoLimit => write!(f, "No Limit"),
            BettingStructure::PotLimit => write!(f, "Pot Limit"),
            BettingStructure::FixedLimit => write!(f, "Fixed Limit"),
        }
    }
}

/// Game type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum GameType {
    TexasHoldem,
    Omaha,
    OmahaHiLo,
    SevenCardStud,
    FiveCardDraw,
    ShortDeck,
}

impl GameType {
    pub fn as_str(self) -> &'static str {
        match self {
            GameType::TexasHoldem => "Texas Hold'em",
            GameType::Omaha => "Omaha",
            GameType::OmahaHiLo => "Omaha Hi-Lo",
            GameType::SevenCardStud => "Seven Card Stud",
            GameType::FiveCardDraw => "Five Card Draw",
            GameType::ShortDeck => "Short Deck",
        }
    }

    pub fn hole_cards_count(self) -> usize {
        match self {
            GameType::TexasHoldem => 2,
            GameType::Omaha | GameType::OmahaHiLo => 4,
            GameType::SevenCardStud => 7,
            GameType::FiveCardDraw => 5,
            GameType::ShortDeck => 2,
        }
    }

    pub fn community_cards_count(self) -> usize {
        match self {
            GameType::TexasHoldem | GameType::Omaha | GameType::OmahaHiLo | GameType::ShortDeck => 5,
            GameType::SevenCardStud => 0,
            GameType::FiveCardDraw => 0,
        }
    }
}

impl fmt::Display for GameType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl FromStr for GameType {
    type Err = PokerError;

    fn from_str(s: &str) -> Result<Self> {
        match s.to_lowercase().as_str() {
            "texas" | "holdem" | "texas holdem" | "texas hold'em" => Ok(GameType::TexasHoldem),
            "omaha" => Ok(GameType::Omaha),
            "omaha hilo" | "omaha hi-lo" | "omaha8" => Ok(GameType::OmahaHiLo),
            "stud" | "7card stud" | "seven card stud" => Ok(GameType::SevenCardStud),
            "draw" | "5card draw" | "five card draw" => Ok(GameType::FiveCardDraw),
            "short deck" | "shortdeck" | "6+" => Ok(GameType::ShortDeck),
            _ => Err(PokerError::InvalidAction(format!("unknown game type: {}", s))),
        }
    }
}
