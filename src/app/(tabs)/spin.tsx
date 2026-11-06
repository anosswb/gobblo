import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { en } from '@/i18n/en';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

export default function SpinScreen() {
  const { colors } = useTheme();
  const pet = useAppStore((s) => s.pet);
  return (
    <Screen eyebrow="coming soon" title="spin">
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Pet size={120} color={pet.color} mood="curious" />
        <Text variant="title2" style={styles.center}>{en.placeholder.spin}</Text>
        <Text variant="subhead" tone="ink2" style={styles.center}>
          {pet.name} picks one bite for you, so you don’t have to.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: space.xxl, alignItems: 'center', gap: space.s },
  center: { textAlign: 'center' },
});
