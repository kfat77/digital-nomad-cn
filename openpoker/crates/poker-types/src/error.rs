use thiserror::Error;

/// The main error type for the OpenPoker engine.
#[derive(Error, Debug, Clone, PartialEq, Eq)]
pub enum PokerError {
    #[error("invalid card string: {0}")]
    InvalidCardString(String),

    #[error("invalid rank: {0}")]
    InvalidRank(String),

    #[error("invalid suit: {0}")]
    InvalidSuit(String),

    #[error("invalid hand: {0}")]
    InvalidHand(String),

    #[error("invalid range: {0}")]
    InvalidRange(String),

    #[error("invalid board: {0}")]
    InvalidBoard(String),

    #[error("invalid action: {0}")]
    InvalidAction(String),

    #[error("invalid position: {0}")]
    InvalidPosition(String),

    #[error("duplicate card: {0}")]
    DuplicateCard(String),

    #[error("not enough cards: need {needed}, got {got}")]
    NotEnoughCards { needed: usize, got: usize },

    #[error("too many cards: max {max}, got {got}")]
    TooManyCards { max: usize, got: usize },

    #[error("parse error: {0}")]
    ParseError(String),

    #[error("io error: {0}")]
    IoError(String),

    #[error("not implemented: {0}")]
    NotImplemented(String),
}

pub type Result<T> = std::result::Result<T, PokerError>;
