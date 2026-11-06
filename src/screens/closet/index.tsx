import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Chips } from '@/components/settings-parts';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { MOODS, Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { petColors, radius, space, type PetColor } from '@/theme/tokens';

const COLOR_LABEL: Record<PetColor, string> = { pink: 'bubblegum', tangerine: 'tangerine', mint: 'mint', violet: 'grape' };

/**
 * Closet (Phase 5 brings hats, colours and rooms). For now: the pet's whole mood set as a
 * gallery, tap one to try it on the big preview, and a colour preview (not saved yet).
 */
export function ClosetScreen() {
  const { colors } = useTheme();
  const pet = useAppStore((s) => s.pet);
  const [mood, setMood] = useState<Mood>('happy');
  const [color, setColor] = useState<PetColor>(pet.color);

  return (
    <Screen eyebrow="hats, colours, rooms soon" title="closet">
      <View style={[styles.preview, { backgroundColor: colors.card }]}>
        <Pet size={150} color={color} mood={mood} onPress={() => play('boop')} accessibilityLabel={`${pet.name} looks ${mood}`} />
        <Text variant="heading">{pet.name} is {mood}</Text>
        <Chips<PetColor>
          accessibilityLabel="colour preview"
          value={color}
          onChange={setColor}
          options={(Object.keys(petColors) as PetColor[]).map((c) => ({ value: c, label: COLOR_LABEL[c], swatch: petColors[c] }))}
        />
      </View>

      <View style={styles.section}>
        <Text variant="title2" accessibilityRole="header" style={styles.head}>
          moods
        </Text>
        <View style={styles.grid}>
          {MOODS.map((m) => {
            const on = m === mood;
            return (
              <Pressable
                key={m}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={m}
                onPress={() => {
                  haptics.select();
                  setMood(m);
                }}
                style={({ pressed }) => [
                  styles.cell,
                  { backgroundColor: on ? colors.primarySoft : colors.card, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Pet size={58} color={color} mood={m} />
                <Text variant="caption" tone={on ? 'primary' : 'ink2'} numberOfLines={1}>
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { borderRadius: radius.card, padding: space.xl, alignItems: 'center', gap: space.m },
  section: { gap: space.m },
  head: { paddingHorizontal: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  cell: { width: '31.6%', flexGrow: 1, borderRadius: radius.card - 8, paddingVertical: space.m, alignItems: 'center', gap: space.xs },
});
