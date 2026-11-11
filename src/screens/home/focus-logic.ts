/**
 * Pure rules for the long-press focus mode on Home (docs/16 point 6). No React here, so they
 * are unit-tested; the "moved" rule also runs inside the pan worklet on the UI thread.
 */

/** Hold this long (ms) before a bite lifts. Long enough that a slow scroll start is not a hold. */
export const HOLD_MS = 320;
/** After the hold fires, moving the finger this far (pt) turns the lift into drag-to-feed. */
export const DRAG_SLOP = 12;
/** One menu row (≥ 44 pt tap target). */
export const MENU_ITEM_H = 48;
/** Space between the lifted bite and its menu. */
export const MENU_GAP = 8;

/** True once the finger has moved far enough from where the hold fired to become a drag. */
export function movedEnough(dx: number, dy: number, slop: number = DRAG_SLOP): boolean {
  'worklet';
  return dx * dx + dy * dy > slop * slop;
}

export const menuHeight = (items: number) => items * MENU_ITEM_H;

/**
 * Where the lifted bite sits (y in the overlay). It stays where it was, unless the menu under it
 * would go past `bottom` (the top of the tab bar): then it moves up just enough. Never above `top`.
 */
export function liftTarget({ y, h, menuH, gap = MENU_GAP, top, bottom }: { y: number; h: number; menuH: number; gap?: number; top: number; bottom: number }): number {
  const fits = y + h + gap + menuH <= bottom;
  const target = fits ? y : bottom - menuH - gap - h;
  return Math.max(top, target);
}

/**
 * The floating tab bar's top edge, measured from the bottom of the screen, plus a little air.
 * Mirrors src/components/tab-bar (bar 62 pt, sits max(inset − 6, 16) from the bottom).
 */
export const tabBarClearance = (insetBottom: number) => Math.max(insetBottom - 6, 16) + 62 + 8;

/** A swipe left on the lifted bite removes it when it went far enough or was flicked. */
export function swipeRemoves(tx: number, vx: number, width: number): boolean {
  'worklet';
  return tx < -width * 0.35 || (tx < -24 && vx < -800);
}
