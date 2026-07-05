/**
 * @openpoker/core — WASM bindings for the OpenPoker engine
 *
 * Provides low-level access to the Rust poker engine compiled to WebAssembly.
 */

export * from './evaluator';
export * from './equity';
export * from './range';
export * from './worker';

export async function initEngine(): Promise<void> {
  // TODO: Initialize WASM module
  console.log('[openpoker/core] Engine initialized');
}
