//! OpenPoker CLI
//!
//! Command-line interface for poker analysis tools.
//!
//! ```bash
//! openpoker equity --hero AsKh --villain QdQc --board Ts9d2h
//! openpoker range parse "AA,AKs,AQo+"
//! ```

use clap::{Parser, Subcommand};
use poker_types::Card;
use poker_equity::{calculate_equity_heads_up, EquityConfig, CalculationMethod};

#[derive(Parser)]
#[command(name = "openpoker")]
#[command(about = "OpenPoker — The Open Poker Intelligence Platform")]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Calculate equity for a hand against opponent hand(s)
    Equity {
        /// Hero's hand (e.g., AsKh)
        #[arg(long)]
        hero: String,
        /// Villain's hand (e.g., QdQc)
        #[arg(long)]
        villain: String,
        /// Community cards (e.g., Ts9d2h)
        #[arg(long)]
        board: Option<String>,
        /// Force exact enumeration
        #[arg(long)]
        exact: bool,
    },
    /// Evaluate a poker hand
    Eval {
        /// Cards to evaluate (e.g., AsKhTsJsQs)
        cards: String,
    },
}

fn parse_cards(s: &str) -> Result<Vec<Card>, String> {
    Card::parse_many(s).map_err(|e| format!("Failed to parse '{}': {}", s, e))
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Equity { hero, villain, board, exact } => {
            let hero_cards = match parse_cards(&hero) {
                Ok(c) if c.len() == 2 => c,
                Ok(c) => { eprintln!("Hero must have exactly 2 cards, got {}", c.len()); std::process::exit(1); }
                Err(e) => { eprintln!("{}", e); std::process::exit(1); }
            };
            let villain_cards = match parse_cards(&villain) {
                Ok(c) if c.len() == 2 => c,
                Ok(c) => { eprintln!("Villain must have exactly 2 cards, got {}", c.len()); std::process::exit(1); }
                Err(e) => { eprintln!("{}", e); std::process::exit(1); }
            };
            let board_cards = match board {
                Some(ref b) => match parse_cards(b) {
                    Ok(c) if c.len() <= 5 => c,
                    Ok(c) => { eprintln!("Board cannot exceed 5 cards, got {}", c.len()); std::process::exit(1); }
                    Err(e) => { eprintln!("{}", e); std::process::exit(1); }
                },
                None => Vec::new(),
            };

            let config = EquityConfig {
                method: if exact { CalculationMethod::Exact } else { CalculationMethod::Auto },
                ..Default::default()
            };

            let result = calculate_equity_heads_up(&hero_cards, &villain_cards, &board_cards, &config);

            println!("┌─────────────────────────────────────────┐");
            println!("│         Equity Calculation Result       │");
            println!("├─────────────────────────────────────────┤");
            println!("│  Hero:    {:>30} │", format_cards(&hero_cards));
            println!("│  Villain: {:>30} │", format_cards(&villain_cards));
            if !board_cards.is_empty() {
                println!("│  Board:   {:>30} │", format_cards(&board_cards));
            }
            println!("├─────────────────────────────────────────┤");
            println!("│  Hero Equity:    {:>22.2}% │", result.equities[0] * 100.0);
            println!("│  Villain Equity: {:>22.2}% │", result.equities[1] * 100.0);
            println!("│  Method:         {:>22} │", if result.is_exact { "Exact" } else { "Monte Carlo" });
            println!("│  Sample Size:    {:>22} │", result.sample_size);
            println!("└─────────────────────────────────────────┘");
        }
        Commands::Eval { cards } => {
            let cards = match parse_cards(&cards) {
                Ok(c) => c,
                Err(e) => { eprintln!("{}", e); std::process::exit(1); }
            };
            let rank = match cards.len() {
                5 => poker_eval::evaluate_5card(&cards),
                6 => poker_eval::evaluate_6card(&cards),
                7 => poker_eval::evaluate_7card(&cards),
                _ => { eprintln!("Expected 5, 6, or 7 cards, got {}", cards.len()); std::process::exit(1); }
            };
            let cat = poker_eval::category_from_rank(rank);
            println!("Hand: {}", format_cards(&cards));
            println!("Category: {}", cat.as_str());
        }
    }
}

fn format_cards(cards: &[Card]) -> String {
    cards.iter().map(|c| c.to_string()).collect::<Vec<_>>().join(" ")
}
