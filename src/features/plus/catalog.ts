/**
 * Gobblo Plus (docs/13-plus-offer.md): ONE unlock, called Plus (2026-11-10: two packs and a bundle
 * confused people). It holds the full closet, the lock-screen focus timer and routine packs.
 * - iOS: one-time App Store purchase (src/lib/purchases.ts). The price shown is a display default
 *   until the store returns the real one.
 * - Android: earned with sparks (no Play billing from Morocco, docs/06).
 * Never locked: anything needed to start a task (dump, 2-minute start, widget start, feed, reminders, repeat).
 */

/** Spark price on Android (~2–3 weeks of normal use, faster with optional rewarded ads). */
export const PLUS_SPARKS = 150;

/** Display default for iOS until the store returns the localized price. */
export const DISPLAY_PRICE = '$4.99';

/** Old pack ids: people who unlocked one before the single Plus keep everything. */
export const LEGACY_PACK_IDS = ['startKit', 'makeItYours', 'focus'] as const;

/** The offer only appears after a week of use (panel: "I'll quit in two weeks, so let me see first"). */
export const OFFER_AFTER_DAYS = 7;

export function canShowOffer(firstOpen: number, now = Date.now()): boolean {
  return now - firstOpen >= OFFER_AFTER_DAYS * 86_400_000;
}

/** True with 'plus' or any old pack id, so nobody loses what they already unlocked. */
export function hasPlus(unlocked: readonly string[]): boolean {
  return unlocked.includes('plus') || LEGACY_PACK_IDS.some((id) => unlocked.includes(id));
}

/** Android: buy Plus with sparks. Returns the new balance, or null if there aren't enough. */
export function spendForPlus(balance: number): number | null {
  return balance >= PLUS_SPARKS ? balance - PLUS_SPARKS : null;
}
