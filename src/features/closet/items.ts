import type { Mood } from '@/pet/pet';
import type { FaceId, HatId } from '@/pet/wardrobe';
import type { PetColor } from '@/theme/tokens';
import type { IconName } from '@/components/icon';
import { weekOfDrop, type DropSlot } from '@/features/weekly/logic';

/**
 * Everything the pet can wear or become, and how it unlocks (DECISIONS 2026-11-07):
 * - level: free, earned by levelling up (one reward per level, 2 → 20)
 * - pack: Gobblo Plus (iOS purchase / Android sparks)
 * - free: from the start
 * - week: a free weekly surprise (a hat, a colour or a room), one each pet week from day 7;
 *   the order lives in features/weekly WEEKLY_DROPS
 * Level 20 ("Legend") is the surprise: golden form + golden crown + gold colour + golden room.
 */
export type Unlock = { type: 'free' } | { type: 'level'; level: number } | { type: 'pack' } | { type: 'week'; week: number };

export type Slot = 'hat' | 'face' | 'color' | 'room';

/** The icon that stands for each kind of item (no emoji in the UI). */
export const SLOT_ICON: Record<Slot, IconName> = { hat: 'crown', face: 'glasses', color: 'palette', room: 'sun' };

export interface Item<Id extends string = string> {
  id: Id;
  slot: Slot;
  name: string;
  emoji: string;
  unlock: Unlock;
}

const free: Unlock = { type: 'free' };
const lv = (level: number): Unlock => ({ type: 'level', level });
const pack: Unlock = { type: 'pack' };
/** unlocks in the pet week the weekly schedule gives this item */
const wk = (slot: DropSlot, id: string): Unlock => ({ type: 'week', week: weekOfDrop(slot, id) });

export const HATS: Item<HatId>[] = [
  { id: 'none', slot: 'hat', name: 'No hat', emoji: '🚫', unlock: free },
  { id: 'party', slot: 'hat', name: 'Party hat', emoji: '🥳', unlock: lv(2) },
  { id: 'bow', slot: 'hat', name: 'Big bow', emoji: '🎀', unlock: lv(3) },
  { id: 'beanie', slot: 'hat', name: 'Beanie', emoji: '🧢', unlock: lv(4) },
  { id: 'flowers', slot: 'hat', name: 'Flower crown', emoji: '🌼', unlock: lv(6) },
  { id: 'cap', slot: 'hat', name: 'Cap', emoji: '🧢', unlock: lv(7) },
  { id: 'catEars', slot: 'hat', name: 'Cat ears', emoji: '🐱', unlock: lv(8) },
  { id: 'sprout', slot: 'hat', name: 'Sprout', emoji: '🌱', unlock: lv(11) },
  { id: 'halo', slot: 'hat', name: 'Halo', emoji: '😇', unlock: lv(14) },
  { id: 'crown', slot: 'hat', name: 'Silver crown', emoji: '👑', unlock: lv(16) },
  { id: 'topHat', slot: 'hat', name: 'Top hat', emoji: '🎩', unlock: lv(18) },
  { id: 'goldCrown', slot: 'hat', name: 'Golden crown', emoji: '👑', unlock: lv(20) },
  { id: 'chef', slot: 'hat', name: 'Chef hat', emoji: '👨‍🍳', unlock: pack },
  { id: 'wizard', slot: 'hat', name: 'Wizard hat', emoji: '🧙', unlock: pack },
  { id: 'bunny', slot: 'hat', name: 'Bunny ears', emoji: '🐰', unlock: pack },
  // weekly surprises (order: features/weekly WEEKLY_DROPS)
  { id: 'mushroom', slot: 'hat', name: 'Mushroom cap', emoji: '🍄', unlock: wk('hat', 'mushroom') },
  { id: 'friedEgg', slot: 'hat', name: 'Fried egg', emoji: '🍳', unlock: wk('hat', 'friedEgg') },
  { id: 'bucket', slot: 'hat', name: 'Bucket hat', emoji: '🪣', unlock: wk('hat', 'bucket') },
  { id: 'propeller', slot: 'hat', name: 'Propeller cap', emoji: '🚁', unlock: wk('hat', 'propeller') },
  { id: 'cowboy', slot: 'hat', name: 'Cowboy hat', emoji: '🤠', unlock: wk('hat', 'cowboy') },
  { id: 'cherries', slot: 'hat', name: 'Cherries', emoji: '🍒', unlock: wk('hat', 'cherries') },
];

export const FACES: Item<FaceId>[] = [
  { id: 'none', slot: 'face', name: 'Nothing', emoji: '🚫', unlock: free },
  { id: 'shades', slot: 'face', name: 'Shades', emoji: '😎', unlock: lv(5) },
  { id: 'round', slot: 'face', name: 'Round glasses', emoji: '🤓', unlock: lv(10) },
  { id: 'hearts', slot: 'face', name: 'Heart glasses', emoji: '😍', unlock: lv(12) },
  { id: 'stars', slot: 'face', name: 'Star glasses', emoji: '🤩', unlock: pack },
  { id: 'mustache', slot: 'face', name: 'Mustache', emoji: '🥸', unlock: pack },
];

export const COLORS: Item<PetColor>[] = [
  { id: 'pink', slot: 'color', name: 'Bubblegum', emoji: '🩷', unlock: free },
  { id: 'tangerine', slot: 'color', name: 'Tangerine', emoji: '🧡', unlock: free },
  { id: 'mint', slot: 'color', name: 'Mint', emoji: '💚', unlock: free },
  { id: 'violet', slot: 'color', name: 'Grape', emoji: '💜', unlock: free },
  { id: 'sky', slot: 'color', name: 'Sky', emoji: '🩵', unlock: lv(15) },
  { id: 'midnight', slot: 'color', name: 'Midnight', emoji: '🌌', unlock: lv(19) },
  { id: 'gold', slot: 'color', name: 'Gold', emoji: '💛', unlock: lv(20) },
  { id: 'lilac', slot: 'color', name: 'Lilac', emoji: '🪻', unlock: pack },
  { id: 'mango', slot: 'color', name: 'Mango', emoji: '🥭', unlock: pack },
  // weekly surprises (order: features/weekly WEEKLY_DROPS)
  { id: 'peach', slot: 'color', name: 'Peach', emoji: '🍑', unlock: wk('color', 'peach') },
  { id: 'lime', slot: 'color', name: 'Lime', emoji: '🍋', unlock: wk('color', 'lime') },
  { id: 'lagoon', slot: 'color', name: 'Lagoon', emoji: '🏝️', unlock: wk('color', 'lagoon') },
  { id: 'cocoa', slot: 'color', name: 'Cocoa', emoji: '🍫', unlock: wk('color', 'cocoa') },
  { id: 'plum', slot: 'color', name: 'Plum', emoji: '🫐', unlock: wk('color', 'plum') },
  { id: 'coral', slot: 'color', name: 'Coral', emoji: '🪸', unlock: wk('color', 'coral') },
  { id: 'denim', slot: 'color', name: 'Denim', emoji: '👖', unlock: wk('color', 'denim') },
  { id: 'blush', slot: 'color', name: 'Blush', emoji: '🌸', unlock: wk('color', 'blush') },
  { id: 'storm', slot: 'color', name: 'Storm', emoji: '🌧️', unlock: wk('color', 'storm') },
  { id: 'cherry', slot: 'color', name: 'Cherry', emoji: '🍒', unlock: wk('color', 'cherry') },
];

export type RoomId = 'auto' | 'sunset' | 'ocean' | 'garden' | 'aurora' | 'galaxy' | 'golden' | 'lavender' | 'sand' | 'mist' | 'rose';

/** Home stage backgrounds ("rooms"). 'auto' follows the time of day. */
export const ROOMS: Item<RoomId>[] = [
  { id: 'auto', slot: 'room', name: 'Time of day', emoji: '🕰️', unlock: free },
  { id: 'sunset', slot: 'room', name: 'Sunset', emoji: '🌅', unlock: lv(9) },
  { id: 'ocean', slot: 'room', name: 'Ocean', emoji: '🌊', unlock: lv(13) },
  { id: 'garden', slot: 'room', name: 'Night garden', emoji: '🌿', unlock: lv(17) },
  { id: 'golden', slot: 'room', name: 'Golden hour', emoji: '✨', unlock: lv(20) },
  { id: 'aurora', slot: 'room', name: 'Aurora', emoji: '🌈', unlock: pack },
  { id: 'galaxy', slot: 'room', name: 'Galaxy', emoji: '🪐', unlock: pack },
  // weekly surprises (order: features/weekly WEEKLY_DROPS)
  { id: 'lavender', slot: 'room', name: 'Lavender', emoji: '🪻', unlock: wk('room', 'lavender') },
  { id: 'sand', slot: 'room', name: 'Sand', emoji: '🏖️', unlock: wk('room', 'sand') },
  { id: 'mist', slot: 'room', name: 'Mist', emoji: '🌫️', unlock: wk('room', 'mist') },
  { id: 'rose', slot: 'room', name: 'Rose', emoji: '🌹', unlock: wk('room', 'rose') },
];

/** Moods the user can set as the pet's face on Home ('auto' reacts to the day). */
export type HomeMood = Mood | 'auto';

/** `week` = the pet week now (features/weekly petWeek). */
export function isUnlocked(u: Unlock, level: number, hasMakeItYours: boolean, week = 0): boolean {
  if (u.type === 'free') return true;
  if (u.type === 'level') return level >= u.level;
  if (u.type === 'week') return week >= u.week;
  return hasMakeItYours;
}

export interface LevelReward {
  level: number;
  /** the evolution form changes at this level */
  stageName?: string;
  items: Item[];
}

/** What each level gives (for the level-up card and the Me "road to 20"). */
export function rewardsFor(level: number, stageAt: Record<number, string>): LevelReward {
  const items = [...HATS, ...FACES, ...COLORS, ...ROOMS].filter((i) => i.unlock.type === 'level' && i.unlock.level === level);
  return { level, stageName: stageAt[level], items };
}
