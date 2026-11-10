/**
 * Plus purchase. This file is the default (Android, web, tests): no purchases at all.
 * iPhone uses purchases.ios.ts (RevenueCat). Same functions in both.
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

/** On app start: true when this store account already owns Plus. */
export async function syncPlus(): Promise<boolean> {
  return false;
}
