import type { IconName } from '@/components/icon';

/**
 * Gobblo Plus (docs/13-plus-offer.md). Three packs, or all three as Plus.
 * - iOS: one-time App Store purchases (RevenueCat in Phase 6). Prices are display defaults; the
 *   real price always comes from the store.
 * - Android: every pack can be earned with sparks (no Play billing from Morocco, docs/06).
 * Never locked: anything needed to start a task (dump, 2-minute start, feed, reminders, repeat).
 */
export type PackId = 'startKit' | 'makeItYours' | 'focus';

export interface Pack {
  id: PackId;
  icon: IconName;
  /** spark price on Android (~2–3 weeks of normal use, faster with optional rewarded ads) */
  sparks: number;
}

export const PACKS: Record<PackId, Pack> = {
  startKit: { id: 'startKit', icon: 'bolt', sparks: 120 },
  makeItYours: { id: 'makeItYours', icon: 'palette', sparks: 150 },
  focus: { id: 'focus', icon: 'headphones', sparks: 120 },
};

export const PACK_IDS = Object.keys(PACKS) as PackId[];

/** Display defaults for iOS until RevenueCat returns localized store prices. */
export const DISPLAY_PRICE = { pack: '$1.99', plus: '$4.99' } as const;

/** The offer only appears after a week of use (panel: "I'll quit in two weeks, so let me see first"). */
export const OFFER_AFTER_DAYS = 7;

export function canShowOffer(firstOpen: number, now = Date.now()): boolean {
  return now - firstOpen >= OFFER_AFTER_DAYS * 86_400_000;
}

export function hasPack(unlocked: readonly string[], id: PackId): boolean {
  return unlocked.includes(id) || unlocked.includes('plus');
}

/** Android: buy a pack with sparks. Returns the new balance, or null if there aren't enough. */
export function spendForPack(balance: number, id: PackId): number | null {
  const cost = PACKS[id].sparks;
  return balance >= cost ? balance - cost : null;
}
