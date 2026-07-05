use poker_types::Card;
pub fn batch_evaluate_7card(hands: &[Vec<Card>]) -> Vec<u32> { use poker_eval::evaluate_7card; hands.iter().map(|c| evaluate_7card(c)).collect() }