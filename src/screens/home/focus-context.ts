import { createContext, useContext } from 'react';
import type { View } from 'react-native';
import type { AnimatedRef } from 'react-native-reanimated';

/** A bite row's box in the focus overlay's coordinates. */
export type FocusRect = { x: number; y: number; w: number; h: number };

/**
 * What a bite row's hold gesture tells the focus overlay (bite-focus.tsx). Kept apart from the
 * overlay so feed-drag.tsx can use it without an import cycle.
 */
export type BiteFocusCtx = {
  /** the overlay box: rows measure themselves against it on the UI thread */
  container: AnimatedRef<View>;
  /** the bite that is lifted right now (its row in the list hides under the copy) */
  liftedId: string | null;
  /** the hold fired: lift this bite */
  onHold: (id: string, rect: FocusRect) => void;
  /** the finger moved after the hold: the menu goes, drag-to-feed takes over */
  onDragStart: () => void;
  /** the finger lifted without moving: the menu stays open (canceled = the system took the touch) */
  onHoldRelease: (canceled: boolean) => void;
  /** a drag ended (fed or missed): focus mode closes */
  onDragEnd: () => void;
};

export const BiteFocusContext = createContext<BiteFocusCtx | null>(null);
export const useBiteFocus = () => useContext(BiteFocusContext);
