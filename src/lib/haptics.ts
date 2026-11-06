import * as Haptics from 'expo-haptics';

import { useAppStore } from '@/state/app-store';

/** Haptics that respect Settings (docs/03 haptics map). Safe to call from JS only. */
const level = () => useAppStore.getState().settings.haptics;

export const haptics = {
  select() {
    if (level() !== 'off') void Haptics.selectionAsync();
  },
  light() {
    const l = level();
    if (l !== 'off') void Haptics.impactAsync(l === 'strong' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  },
  medium() {
    const l = level();
    if (l !== 'off') void Haptics.impactAsync(l === 'strong' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
  },
  success() {
    if (level() !== 'off') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning() {
    if (level() !== 'off') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
