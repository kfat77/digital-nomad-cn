/**
 * @openpoker/sdk — High-level SDK for poker analysis
 *
 * ```ts
 * import { PokerSDK } from '@openpoker/sdk';
 * const sdk = new PokerSDK();
 * const result = await sdk.calculateEquity({ hero: 'AsKh', villain: ['JJ+'] });
 * ```
 */

export class PokerSDK {
  // TODO: Implement SDK
}

export * from './client';
export * from './engine';
export * from './range';
