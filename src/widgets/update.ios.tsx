import * as Linking from 'expo-linking';

import { NextBiteIOS } from './ios/next-bite-widget';
import { readWidgetData } from './widget-data';

/** iOS has no "pin widget" API: the Plus screen shows how to add it by hand. */
export const widgetsSupported = true;

/** Redraw the iOS widget (home + lock screen) after bites, the pet or Plus change. */
export function updateWidgets() {
  try {
    const d = readWidgetData();
    NextBiteIOS.updateSnapshot({
      petName: d.petName,
      biteText: d.bite?.text ?? null,
      emoji: d.bite?.emoji ?? '🍬',
      minutes: d.bite?.min ?? 2,
      left: d.left,
      canStart: d.canStart,
      startUrl: d.bite ? Linking.createURL('/start', { queryParams: { bite: d.bite.id } }) : Linking.createURL('/'),
      openUrl: Linking.createURL('/'),
    });
  } catch {
    // widget extension missing (Expo Go / old build): nothing to update
  }
}

export async function addWidgetToHomeScreen(): Promise<boolean> {
  return false;
}
