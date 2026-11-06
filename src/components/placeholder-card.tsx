import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

/** Temporary Phase 1 card, replaced screen by screen in Phases 3–5. */
export function PlaceholderCard({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line, shadowColor: colors.shadow }]}>
      <Text variant="heading">{title}</Text>
      <Text tone="ink2">{en.placeholder.soon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.xl,
    gap: space.s,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
});
