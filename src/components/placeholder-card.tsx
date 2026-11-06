import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

/** Temporary Phase 1 card, replaced screen by screen in Phases 3–5. */
export function PlaceholderCard({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text variant="heading">{title}</Text>
      <Text variant="subhead" tone="ink2">{en.placeholder.soon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: space.xl,
    gap: space.xs,
  },
});
