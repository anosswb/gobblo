import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

/** A plain card in the toolkit style (same surface as the Me cards). */
export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, style]}>{children}</View>;
}

/** The big primary pill (thumb zone). `soft` = tinted secondary. */
export function Button({
  label,
  onPress,
  soft = false,
  icon,
  accessibilityLabel,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  soft?: boolean;
  icon?: IconName;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: soft ? colors.primarySoft : colors.primary, opacity: disabled ? 0.5 : 1 }]}>
      {icon ? <Icon name={icon} size={18} color={soft ? colors.primary : colors.onPrimary} /> : null}
      <Text variant="bodyBold" tone={soft ? 'primary' : 'onPrimary'}>
        {label}
      </Text>
    </PressScale>
  );
}

export const toolStyles = StyleSheet.create({
  intro: { paddingHorizontal: space.xs, marginTop: -space.s },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: space.m },
  flex: { flex: 1 },
});

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: space.l + 2, gap: space.m, borderWidth: StyleSheet.hairlineWidth },
  button: { minHeight: 52, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.s, paddingHorizontal: space.xl },
});
