//! Heads-up exact equity calculator.
use poker_eval::evaluate_7card;
use poker_types::Card;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MatchupResult {
    pub hero_equity: f64,
    pub villain_equity: f64,
    pub tie_probability: f64,
    pub total_outcomes: u64,
}

pub fn heads_up_exact(hero: &[Card], villain: &[Card], board: &[Card]) -> MatchupResult {
    assert_eq!(hero.len(), 2); assert_eq!(villain.len(), 2); assert!(board.len() <= 5);
    let remaining = 5 - board.len();
    if remaining == 0 {
        let mut hc = Vec::with_capacity(7); hc.extend_from_slice(hero); hc.extend_from_slice(board);
        let mut vc = Vec::with_capacity(7); vc.extend_from_slice(villain); vc.extend_from_slice(board);
        let hr = evaluate_7card(&hc); let vr = evaluate_7card(&vc);
        if hr > vr { return MatchupResult { hero_equity: 1.0, villain_equity: 0.0, tie_probability: 0.0, total_outcomes: 1 }; }
        else if vr > hr { return MatchupResult { hero_equity: 0.0, villain_equity: 1.0, tie_probability: 0.0, total_outcomes: 1 }; }
        else { return MatchupResult { hero_equity: 0.5, villain_equity: 0.5, tie_probability: 1.0, total_outcomes: 1 }; }
    }
    let known: std::collections::HashSet<u8> = hero.iter().chain(villain.iter()).chain(board.iter()).map(|c| c.index()).collect();
    let mut avail = Vec::with_capacity(52 - known.len());
    for rank in poker_types::Rank::ALL { for suit in poker_types::Suit::ALL { let c = Card::new(rank, suit); if !known.contains(&c.index()) { avail.push(c); } } }
    let n = avail.len(); let mut hw = 0u64; let mut vw = 0u64; let mut ties = 0u64;
    if remaining == 1 { for &c in &avail { match sd(hero, villain, board, &[c]) { SR::HW => hw += 1, SR::VW => vw += 1, SR::Tie => ties += 1 } } }
    else if remaining == 2 { for i in 0..n { for j in (i+1)..n { match sd(hero, villain, board, &[avail[i], avail[j]]) { SR::HW => hw += 1, SR::VW => vw += 1, SR::Tie => ties += 1 } } } }
    else if remaining == 5 { for i in 0..n { for j in (i+1)..n { for k in (j+1)..n { for l in (k+1)..n { for m in (l+1)..n { match sd(hero, villain, board, &[avail[i], avail[j], avail[k], avail[l], avail[m]]) { SR::HW => hw += 1, SR::VW => vw += 1, SR::Tie => ties += 1 } } } } } } }
    else { for combo in gc(&avail, remaining) { match sd(hero, villain, board, &combo) { SR::HW => hw += 1, SR::VW => vw += 1, SR::Tie => ties += 1 } } }
    let total = hw + vw + ties;
    MatchupResult { hero_equity: hw as f64 / total as f64, villain_equity: vw as f64 / total as f64, tie_probability: ties as f64 / total as f64, total_outcomes: total }
}

fn sd(hero: &[Card], villain: &[Card], board: &[Card], runout: &[Card]) -> SR {
    let mut hc = Vec::with_capacity(7); hc.extend_from_slice(hero); hc.extend_from_slice(board); hc.extend_from_slice(runout);
    let mut vc = Vec::with_capacity(7); vc.extend_from_slice(villain); vc.extend_from_slice(board); vc.extend_from_slice(runout);
    let hr = evaluate_7card(&hc); let vr = evaluate_7card(&vc);
    if hr > vr { SR::HW } else if vr > hr { SR::VW } else { SR::Tie }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum SR { HW, VW, Tie }

fn gc(items: &[Card], k: usize) -> Vec<Vec<Card>> {
    let mut res = Vec::new(); let mut cur = Vec::with_capacity(k); bt(items, k, 0, &mut cur, &mut res); res
}
fn bt(items: &[Card], k: usize, s: usize, cur: &mut Vec<Card>, res: &mut Vec<Vec<Card>>) {
    if cur.len() == k { res.push(cur.clone()); return; }
    for i in s..items.len() { cur.push(items[i]); bt(items, k, i+1, cur, res); cur.pop(); }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn p(s: &str) -> Vec<Card> { Card::parse_many(s).unwrap() }
    #[test] fn test_ak_vs_qq() { let r = heads_up_exact(&p("AsKs"), &p("QdQc"), &[]); assert!(r.hero_equity > 0.43); assert!(r.hero_equity < 0.48); }
    #[test] fn test_river() {
        // AA vs KK on T-J-Q-7-8 board: AA has a pair of Aces, KK has a pair of Kings
        let r = heads_up_exact(&p("AsAd"), &p("KsKd"), &p("TsJsQs7h8h"));
        assert_eq!(r.hero_equity, 1.0);
    }
    #[test] fn test_flop() { let r = heads_up_exact(&p("AsKs"), &p("QdQc"), &p("TsJs2h")); assert!(r.hero_equity > 0.40); assert!(r.hero_equity < 0.60); }
}
