//! Monte Carlo equity simulation.
use poker_eval::evaluate_7card;
use poker_types::Card;
use rand::seq::SliceRandom;

#[derive(Debug, Clone, PartialEq)]
pub struct MonteCarloResult {
    pub equities: Vec<f64>, pub wins: Vec<u64>, pub ties: Vec<u64>,
    pub total_simulations: u64, pub num_players: usize,
}
impl MonteCarloResult {
    pub fn equity(&self, player: usize) -> f64 { self.equities.get(player).copied().unwrap_or(0.0) }
}

pub fn monte_carlo_heads_up(hero: &[Card], villain: &[Card], board: &[Card], n: u64) -> MonteCarloResult {
    let mut rng = rand::thread_rng(); let rem = 5 - board.len();
    let known: std::collections::HashSet<u8> = hero.iter().chain(villain.iter()).chain(board.iter()).map(|c| c.index()).collect();
    let mut avail = Vec::with_capacity(52 - known.len());
    for rank in poker_types::Rank::ALL { for suit in poker_types::Suit::ALL { let c = Card::new(rank, suit); if !known.contains(&c.index()) { avail.push(c); } } }
    let mut hw = 0u64; let mut vw = 0u64; let mut ties = 0u64;
    for _ in 0..n {
        let runout: Vec<Card> = avail.choose_multiple(&mut rng, rem).copied().collect();
        let mut hc = Vec::with_capacity(7); hc.extend_from_slice(hero); hc.extend_from_slice(board); hc.extend_from_slice(&runout);
        let mut vc = Vec::with_capacity(7); vc.extend_from_slice(villain); vc.extend_from_slice(board); vc.extend_from_slice(&runout);
        let hr = evaluate_7card(&hc); let vr = evaluate_7card(&vc);
        if hr > vr { hw += 1; } else if vr > hr { vw += 1; } else { ties += 1; }
    }
    let total = hw + vw + ties;
    MonteCarloResult { equities: vec![hw as f64/total as f64 + ties as f64/total as f64/2.0, vw as f64/total as f64 + ties as f64/total as f64/2.0], wins: vec![hw, vw], ties: vec![ties; 2], total_simulations: total, num_players: 2 }
}

pub fn monte_carlo_multiway(hands: &[Vec<Card>], board: &[Card], n: u64) -> MonteCarloResult {
    assert!(!hands.is_empty()); let np = hands.len();
    let mut rng = rand::thread_rng(); let rem = 5 - board.len();
    let mut known = std::collections::HashSet::new();
    for hand in hands { for card in hand { known.insert(card.index()); } }
    for card in board { known.insert(card.index()); }
    let mut avail = Vec::with_capacity(52 - known.len());
    for rank in poker_types::Rank::ALL { for suit in poker_types::Suit::ALL { let c = Card::new(rank, suit); if !known.contains(&c.index()) { avail.push(c); } } }
    let mut wc = vec![0u64; np]; let mut tc = vec![0u64; np];
    for _ in 0..n {
        let runout: Vec<Card> = avail.choose_multiple(&mut rng, rem).copied().collect();
        let mut br = 0u32; let mut winners = Vec::new();
        for (i, hand) in hands.iter().enumerate() {
            let mut c = Vec::with_capacity(7); c.extend_from_slice(hand); c.extend_from_slice(board); c.extend_from_slice(&runout);
            let r = evaluate_7card(&c);
            if r > br { br = r; winners.clear(); winners.push(i); }
            else if r == br { winners.push(i); }
        }
        if winners.len() == 1 { wc[winners[0]] += 1; } else { for &i in &winners { tc[i] += 1; } }
    }
    let total = n;
    let eq: Vec<f64> = (0..np).map(|i| wc[i] as f64/total as f64 + tc[i] as f64/total as f64/2.0).collect();
    MonteCarloResult { equities: eq, wins: wc, ties: tc, total_simulations: total, num_players: np }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn p(s: &str) -> Vec<Card> { Card::parse_many(s).unwrap() }
    #[test] fn test_mc() { let r = monte_carlo_heads_up(&p("AsKs"), &p("QdQc"), &[], 10000); assert!(r.equity(0) > 0.40); assert!(r.equity(0) < 0.50); }
}
