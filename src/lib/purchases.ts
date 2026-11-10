/**
 * iOS Plus purchase. Stubs for now: a later task wires RevenueCat here. The Plus screen only
 * talks to these three functions, so nothing else changes then.
 */
export type BuyResult = 'bought' | 'cancelled' | 'unavailable';

/** The store's localized price (e.g. "$4.99"), or null when it is not known yet. */
export async function getPlusPrice(): Promise<string | null> {
  return null;
}

export async function buyPlus(): Promise<BuyResult> {
  return 'unavailable';
}

/** True if a Plus purchase was found and restored. */
export async function restorePlus(): Promise<boolean> {
  return false;
}
