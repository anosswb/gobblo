import type { Size } from '@/state/schema';

/** Start Kit routine packs: one tap adds a set of daily bites (DECISIONS: repeat itself stays free). */
export type RoutineId = 'morning' | 'study' | 'sunday';

export const ROUTINES: Record<RoutineId, { emoji: string; bites: { text: string; size: Size }[] }> = {
  morning: {
    emoji: '🌅',
    bites: [
      { text: 'Drink a glass of water', size: 0 },
      { text: 'Make the bed', size: 0 },
      { text: 'Brush teeth', size: 0 },
      { text: 'Get dressed', size: 1 },
      { text: 'Pack your bag', size: 1 },
    ],
  },
  study: {
    emoji: '📚',
    bites: [
      { text: 'Open the notes. That’s it.', size: 0 },
      { text: 'Read one page', size: 1 },
      { text: 'Do one question', size: 1 },
      { text: 'One 25-minute block', size: 3 },
      { text: 'Tidy the desk', size: 0 },
    ],
  },
  sunday: {
    emoji: '🧺',
    bites: [
      { text: 'Start a laundry load', size: 1 },
      { text: 'Clear one surface', size: 1 },
      { text: 'Take out the trash', size: 0 },
      { text: 'Pick 3 bites for Monday', size: 1 },
      { text: 'Wipe one fridge shelf', size: 2 },
    ],
  },
};

export const ROUTINE_IDS = Object.keys(ROUTINES) as RoutineId[];
