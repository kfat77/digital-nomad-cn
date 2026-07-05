import init, { equity_heads_up, eval_hand } from './wasm/openpoker_wasm.js';

let initialized = false;

export async function initWasm() {
    if (initialized) return;
    await init();
    initialized = true;
}

export async function calculateEquity(hero: string, villain: string, board: string, exact: boolean): Promise<{hero_equity: number, villain_equity: number, is_exact: boolean, sample_size: number}> {
    await initWasm();
    const result = equity_heads_up(hero, villain, board, exact);
    return JSON.parse(result);
}

export async function evaluateHand(cards: string): Promise<string> {
    await initWasm();
    return eval_hand(cards);
}
