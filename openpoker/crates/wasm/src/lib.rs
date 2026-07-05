//! OpenPoker WASM bindings
//!
//! Exposes poker-equity and poker-eval functionality to JavaScript.

use wasm_bindgen::prelude::*;
use poker_types::Card;
use poker_equity::{calculate_equity_heads_up, EquityConfig, CalculationMethod};

/// Parse a hand string into cards.
#[wasm_bindgen]
pub fn parse_cards(s: &str) -> Result<JsValue, JsValue> {
    let cards = Card::parse_many(s).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
    let indices: Vec<u8> = cards.iter().map(|c| c.index()).collect();
    Ok(serde_wasm_bindgen::to_value(&indices).unwrap())
}

/// Evaluate a 5-card hand and return its category string.
#[wasm_bindgen]
pub fn eval_hand(cards_json: &str) -> Result<String, JsValue> {
    let cards = Card::parse_many(cards_json).map_err(|e| JsValue::from_str(&format!("{}", e)))?;
    if cards.len() != 5 {
        return Err(JsValue::from_str("Expected exactly 5 cards"));
    }
    let rank = poker_eval::evaluate_5card(&cards);
    let cat = poker_eval::category_from_rank(rank);
    Ok(cat.as_str().to_string())
}

/// Calculate equity for a heads-up matchup.
/// Returns JSON: {"hero_equity": 0.46, "villain_equity": 0.54, "is_exact": true}
#[wasm_bindgen]
pub fn equity_heads_up(hero: &str, villain: &str, board: &str, exact: bool) -> Result<String, JsValue> {
    let hero_cards = Card::parse_many(hero).map_err(|e| JsValue::from_str(&format!("Hero parse error: {}", e)))?;
    let villain_cards = Card::parse_many(villain).map_err(|e| JsValue::from_str(&format!("Villain parse error: {}", e)))?;
    let board_cards = if board.is_empty() {
        Vec::new()
    } else {
        Card::parse_many(board).map_err(|e| JsValue::from_str(&format!("Board parse error: {}", e)))?
    };

    if hero_cards.len() != 2 || villain_cards.len() != 2 {
        return Err(JsValue::from_str("Hero and villain must each have 2 cards"));
    }

    let config = EquityConfig {
        method: if exact { CalculationMethod::Exact } else { CalculationMethod::Auto },
        ..Default::default()
    };

    let result = calculate_equity_heads_up(&hero_cards, &villain_cards, &board_cards, &config);

    Ok(format!(
        "{{\"hero_equity\":{:.6},\"villain_equity\":{:.6},\"is_exact\":{},\"sample_size\":{}}}",
        result.equities[0],
        result.equities[1],
        result.is_exact,
        result.sample_size
    ))
}
