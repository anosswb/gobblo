import { backOrHome } from '@/lib/nav';
import { CaretLeft } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

/** Back button + big title (pushed screens). Android back button works via the stack. */
export function ScreenHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={10}
        onPress={backOrHome}
        style={[styles.back, { backgroundColor: colors.card, borderColor: colors.line }]}>
        <CaretLeft size={22} weight="bold" color={colors.ink} />
      </PressScale>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.l },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
