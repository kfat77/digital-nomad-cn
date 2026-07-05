use crate::action::{BettingStructure, GameType, Street};
use crate::card::Card;
use crate::error::{PokerError, Result};
use crate::player::Player;
use crate::range::HandRange;
use serde::{Deserialize, Serialize};
use std::fmt;

/// A game state snapshot at a specific street.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GameState {
    pub game_type: GameType,
    pub betting_structure: BettingStructure,
    /// Small blind size in big blinds
    pub small_blind: f64,
    /// Big blind size (usually 1.0 = 1 BB)
    pub big_blind: f64,
    /// The current street
    pub street: Street,
    /// Community cards on the board
    pub board: Vec<Card>,
    /// Players at the table (in order of action)
    pub players: Vec<Player>,
    /// Hero's hole cards (if known)
    pub hero_cards: Option<(Card, Card)>,
    /// Active player's name
    pub active_player: String,
    /// Amount to call (in BB)
    pub to_call: f64,
    /// Current pot size (in BB)
    pub pot: f64,
    /// Minimum raise size (in BB)
    pub min_raise: f64,
    /// Previous actions this hand
    pub action_history: Vec<ActionRecord>,
    /// Effective stack in play (in BB)
    pub effective_stack: f64,
    /// Number of players still in the hand
    pub num_players_in_hand: usize,
}

/// A recorded action in the hand history.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ActionRecord {
    pub player_name: String,
    pub street: Street,
    pub action: String,
    pub amount: Option<f64>,
}

impl GameState {
    /// Create a new game state.
    pub fn new(
        game_type: GameType,
        betting_structure: BettingStructure,
        big_blind: f64,
    ) -> Self {
        GameState {
            game_type,
            betting_structure,
            small_blind: big_blind / 2.0,
            big_blind,
            street: Street::Preflop,
            board: Vec::new(),
            players: Vec::new(),
            hero_cards: None,
            active_player: String::new(),
            to_call: 0.0,
            pot: 0.0,
            min_raise: big_blind,
            action_history: Vec::new(),
            effective_stack: 0.0,
            num_players_in_hand: 0,
        }
    }

    /// Add a player to the game.
    pub fn add_player(&mut self, player: Player) {
        if player.is_hero {
            // Ensure only one hero
            for p in &mut self.players {
                p.is_hero = false;
            }
        }
        self.players.push(player);
        self.num_players_in_hand = self.players.iter().filter(|p| p.is_active).count();
        self.effective_stack = self.calculate_effective_stack();
    }

    /// Set hero's hole cards.
    pub fn set_hero_cards(&mut self, c1: Card, c2: Card) {
        self.hero_cards = Some((c1, c2));
    }

    /// Add a community card (or cards) to the board.
    pub fn add_board_cards(&mut self, cards: &[Card]) {
        self.board.extend(cards);
    }

    /// Set the board from a string (e.g., "Ts9d2h" or "Ts 9d 2h").
    pub fn set_board_from_str(&mut self, s: &str) -> Result<()> {
        self.board = Card::parse_many(s)?;
        Ok(())
    }

    /// Advance to the next street.
    pub fn advance_street(&mut self) -> Result<()> {
        self.street = self.street.next()
            .ok_or_else(|| PokerError::InvalidAction("cannot advance past showdown".to_string()))?;
        self.to_call = 0.0;
        self.min_raise = self.big_blind;
        Ok(())
    }

    /// Record an action.
    pub fn record_action(&mut self, player_name: &str, action: &str, amount: Option<f64>) {
        self.action_history.push(ActionRecord {
            player_name: player_name.to_string(),
            street: self.street,
            action: action.to_string(),
            amount,
        });
    }

    /// Get the hero player.
    pub fn hero(&self) -> Option<&Player> {
        self.players.iter().find(|p| p.is_hero)
    }

    /// Get all villains (non-hero players).
    pub fn villains(&self) -> impl Iterator<Item = &Player> {
        self.players.iter().filter(|p| !p.is_hero)
    }

    /// Get active players (still in the hand).
    pub fn active_players(&self) -> impl Iterator<Item = &Player> {
        self.players.iter().filter(|p| p.is_active)
    }

    /// Calculate the effective stack (smallest stack among active players).
    fn calculate_effective_stack(&self) -> f64 {
        self.players
            .iter()
            .filter(|p| p.is_active)
            .map(|p| p.stack)
            .min_by(|a, b| a.partial_cmp(b).unwrap())
            .unwrap_or(0.0)
    }

    /// Stack-to-pot ratio.
    pub fn spr(&self) -> f64 {
        if self.pot == 0.0 {
            0.0
        } else {
            self.effective_stack / self.pot
        }
    }

    /// Pot odds as a percentage.
    pub fn pot_odds(&self) -> f64 {
        let total_pot = self.pot + self.to_call;
        if total_pot == 0.0 {
            0.0
        } else {
            self.to_call / total_pot * 100.0
        }
    }

    /// Minimum defense frequency.
    pub fn mdf(&self) -> f64 {
        let total_pot = self.pot + self.to_call;
        if total_pot == 0.0 {
            0.0
        } else {
            self.pot / total_pot * 100.0
        }
    }
}

impl Default for GameState {
    fn default() -> Self {
        Self::new(GameType::TexasHoldem, BettingStructure::NoLimit, 1.0)
    }
}

impl fmt::Display for GameState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "{} {} (BB: {})", self.game_type, self.betting_structure, self.big_blind)?;
        writeln!(f, "Street: {} | Pot: {} BB | To Call: {} BB", self.street, self.pot, self.to_call)?;
        writeln!(f, "Board: {}", self.board.iter().map(|c| c.to_string()).collect::<Vec<_>>().join(" "))?;
        if let Some((c1, c2)) = self.hero_cards {
            writeln!(f, "Hero: {} {}", c1, c2)?;
        }
        writeln!(f, "Players ({}):", self.players.len())?;
        for p in &self.players {
            let marker = if p.is_hero { " [H]" } else { "" };
            let active = if p.is_active { "" } else { " (folded)" };
            writeln!(f, "  {}{}: {} BB{}{}", p.position, marker, p.stack, active, p.name)?;
        }
        Ok(())
    }
}

/// A scenario for equity calculation.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EquityScenario {
    pub hero_range: Option<HandRange>,
    pub hero_cards: Option<(Card, Card)>,
    pub villain_ranges: Vec<HandRange>,
    pub villain_cards: Vec<(Card, Card)>,
    pub board: Vec<Card>,
    pub dead_cards: Vec<Card>,
    pub num_simulations: u64,
}

impl EquityScenario {
    pub fn new() -> Self {
        EquityScenario {
            hero_range: None,
            hero_cards: None,
            villain_ranges: Vec::new(),
            villain_cards: Vec::new(),
            board: Vec::new(),
            dead_cards: Vec::new(),
            num_simulations: 100_000,
        }
    }

    pub fn with_hero_cards(mut self, c1: Card, c2: Card) -> Self {
        self.hero_cards = Some((c1, c2));
        self
    }

    pub fn with_hero_range(mut self, range: HandRange) -> Self {
        self.hero_range = Some(range);
        self
    }

    pub fn add_villain_range(mut self, range: HandRange) -> Self {
        self.villain_ranges.push(range);
        self
    }

    pub fn add_villain_cards(mut self, c1: Card, c2: Card) -> Self {
        self.villain_cards.push((c1, c2));
        self
    }

    pub fn with_board(mut self, board: &[Card]) -> Self {
        self.board = board.to_vec();
        self
    }

    pub fn with_simulations(mut self, n: u64) -> Self {
        self.num_simulations = n;
        self
    }
}

impl Default for EquityScenario {
    fn default() -> Self {
        Self::new()
    }
}
