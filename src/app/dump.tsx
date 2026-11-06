import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { space } from '@/theme/tokens';

/** Brain dump, presented as a native iOS form sheet (grabber, detents). Phase 3 fills it. */
export default function DumpScreen() {
  const { colors } = useTheme();
  const pet = useAppStore((s) => s.pet);
  return (
    <View style={[styles.wrap, { backgroundColor: colors.card }]}>
      <View style={styles.top}>
        <Text variant="title2" style={styles.flex}>brain dump</Text>
        <PressScale accessibilityRole="button" accessibilityLabel="close" hitSlop={8} onPress={() => router.back()} style={[styles.close, { backgroundColor: colors.fill }]}>
          <Icon name="close" size={14} weight="bold" color={colors.ink2} />
        </PressScale>
      </View>
      <View style={styles.body}>
        <Pet size={110} color={pet.color} mood="hungry" />
        <Text variant="heading" style={styles.center}>{en.placeholder.dump}</Text>
        <Text variant="subhead" tone="ink2" style={styles.center}>{en.placeholder.soon}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space.xl, paddingTop: space.xl },
  top: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  body: { alignItems: 'center', gap: space.s, paddingTop: space.xxl },
  center: { textAlign: 'center' },
});
