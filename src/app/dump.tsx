import { router } from 'expo-router';
import { X } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceholderCard } from '@/components/placeholder-card';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

export default function DumpScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg, paddingTop: insets.top + space.l }]}>
      <PressScale accessibilityRole="button" accessibilityLabel="close" hitSlop={12} onPress={() => router.back()} style={styles.close}>
        <X size={26} weight="bold" color={colors.ink} />
      </PressScale>
      <Text variant="title">{en.placeholder.dump}</Text>
      <PlaceholderCard title="brain dump → bites" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space.gutter, gap: space.l },
  close: { alignSelf: 'flex-end', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
