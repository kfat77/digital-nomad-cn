use crate::error::{PokerError, Result};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/// A player's position at the poker table.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[repr(u8)]
pub enum Position {
    // Early position
    UTG = 0,      // Under the Gun
    UTG1 = 1,     // UTG+1
    UTG2 = 2,     // UTG+2
    // Middle position
    MP = 3,       // Middle Position
    MP1 = 4,      // MP+1
    MP2 = 5,      // MP+2
    // Late position
    LJ = 6,       // Lojack
    HJ = 7,       // Hijack
    CO = 8,       // Cutoff
    BTN = 9,      // Button
    // Blinds
    SB = 10,      // Small Blind
    BB = 11,      // Big Blind
}

impl Position {
    /// Full ring (9-max) positions.
    pub const FULL_RING: [Position; 9] = [
        Position::UTG, Position::UTG1, Position::MP,
        Position::HJ, Position::CO, Position::BTN,
        Position::SB, Position::BB, Position::LJ,
    ];

    /// 6-max positions.
    pub const SIX_MAX: [Position; 6] = [
        Position::UTG, Position::HJ, Position::CO,
        Position::BTN, Position::SB, Position::BB,
    ];

    pub fn as_str(self) -> &'static str {
        match self {
            Position::UTG => "UTG",
            Position::UTG1 => "UTG+1",
            Position::UTG2 => "UTG+2",
            Position::MP => "MP",
            Position::MP1 => "MP+1",
            Position::MP2 => "MP+2",
            Position::LJ => "LJ",
            Position::HJ => "HJ",
            Position::CO => "CO",
            Position::BTN => "BTN",
            Position::SB => "SB",
            Position::BB => "BB",
        }
    }

    pub fn is_early(self) -> bool {
        matches!(self, Position::UTG | Position::UTG1 | Position::UTG2 | Position::MP)
    }

    pub fn is_middle(self) -> bool {
        matches!(self, Position::MP1 | Position::MP2 | Position::LJ | Position::HJ)
    }

    pub fn is_late(self) -> bool {
        matches!(self, Position::CO | Position::BTN)
    }

    pub fn is_blind(self) -> bool {
        matches!(self, Position::SB | Position::BB)
    }

    /// Get the position relative to the button.
    /// 0 = button, 1 = CO, etc.
    pub fn distance_from_button(self) -> u8 {
        match self {
            Position::BTN => 0,
            Position::CO => 1,
            Position::HJ => 2,
            Position::LJ => 3,
            Position::MP2 => 4,
            Position::MP1 => 5,
            Position::MP => 6,
            Position::UTG2 => 7,
            Position::UTG1 => 8,
            Position::UTG => 9,
            Position::BB => 10,
            Position::SB => 11,
        }
    }
}

impl fmt::Display for Position {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl FromStr for Position {
    type Err = PokerError;

    fn from_str(s: &str) -> Result<Self> {
        match s.to_uppercase().as_str() {
            "UTG" => Ok(Position::UTG),
            "UTG+1" | "UTG1" => Ok(Position::UTG1),
            "UTG+2" | "UTG2" => Ok(Position::UTG2),
            "MP" => Ok(Position::MP),
            "MP+1" | "MP1" => Ok(Position::MP1),
            "MP+2" | "MP2" => Ok(Position::MP2),
            "LJ" | "LOJACK" => Ok(Position::LJ),
            "HJ" | "HIJACK" => Ok(Position::HJ),
            "CO" | "CUTOFF" => Ok(Position::CO),
            "BTN" | "BUTTON" => Ok(Position::BTN),
            "SB" | "SMALLBLIND" => Ok(Position::SB),
            "BB" | "BIGBLIND" => Ok(Position::BB),
            _ => Err(PokerError::InvalidPosition(s.to_string())),
        }
    }
}

/// A player at the table.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Player {
    pub name: String,
    pub position: Position,
    pub stack: f64,         // Stack in big blinds
    pub is_hero: bool,
    pub is_active: bool,
}

impl Player {
    pub fn new(name: impl Into<String>, position: Position, stack: f64) -> Self {
        Player {
            name: name.into(),
            position,
            stack,
            is_hero: false,
            is_active: true,
        }
    }

    pub fn hero(name: impl Into<String>, position: Position, stack: f64) -> Self {
        let mut player = Self::new(name, position, stack);
        player.is_hero = true;
        player
    }
}
