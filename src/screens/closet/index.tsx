import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Segmented } from '@/components/segmented';
import { Chips } from '@/components/settings-parts';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { capFirst } from '@/features/bites/logic';
import { STAGES } from '@/features/progress/logic';
import { usePetStage } from '@/features/progress/use-pet-stage';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { MOODS, Pet, type Mood } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { useTheme } from '@/theme/theme-provider';
import { petColors, radius, space, type PetColor } from '@/theme/tokens';

const COLOR_LABEL: Record<PetColor, string> = { pink: 'Bubblegum', tangerine: 'Tangerine', mint: 'Mint', violet: 'Grape' };

/**
 * Closet (Phase 5 brings hats, colours and rooms). For now: the pet's whole mood set as a
 * gallery, tap one to try it on the big preview, and a colour preview (not saved yet).
 */
export function ClosetScreen() {
  const { colors } = useTheme();
  const pet = useAppStore((s) => s.pet);
  const [mood, setMood] = useState<Mood>('happy');
  const [color, setColor] = useState<PetColor>(pet.color);
  const current = usePetStage();
  const [stage, setStage] = useState(String(current));

  return (
    <Screen eyebrow="Hats, colours, rooms soon" title="Closet">
      <View style={[styles.preview, { backgroundColor: colors.card }]}>
        <Pet size={150} color={color} mood={mood} stage={Number(stage)} onPress={() => play('boop')} accessibilityLabel={`${pet.name} looks ${mood}`} />
        <Text variant="heading">{pet.name} is {mood}</Text>
        <Text variant="caption" tone="ink2">
          {Number(stage) === current ? `Now: ${STAGES[current].name}` : Number(stage) > current ? `At ${STAGES[Number(stage)].at} ✦: ${STAGES[Number(stage)].name}` : STAGES[Number(stage)].name}
        </Text>
        <View style={styles.full}>
          <Segmented
            accessibilityLabel="Evolution preview"
            value={stage}
            onChange={setStage}
            options={STAGES.map((_, i) => ({ value: String(i), label: `Lv ${i + 1}` }))}
          />
        </View>
        <Chips<PetColor>
          accessibilityLabel="Colour preview"
          value={color}
          onChange={setColor}
          options={(Object.keys(petColors) as PetColor[]).map((c) => ({ value: c, label: COLOR_LABEL[c], swatch: petColors[c] }))}
        />
      </View>

      <View style={styles.section}>
        <Text variant="title2" accessibilityRole="header" style={styles.head}>
          Moods
        </Text>
        <View style={styles.grid}>
          {MOODS.map((m) => {
            const on = m === mood;
            return (
              <Pressable
                key={m}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={capFirst(m)}
                onPress={() => {
                  haptics.select();
                  setMood(m);
                }}
                style={({ pressed }) => [
                  styles.cell,
                  { backgroundColor: on ? colors.primarySoft : colors.card, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Pet size={58} color={color} mood={m} stage={Number(stage)} still />
                <Text variant="caption" tone={on ? 'primary' : 'ink2'} numberOfLines={1}>
                  {capFirst(m)}
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
  full: { alignSelf: 'stretch' },
  section: { gap: space.m },
  head: { paddingHorizontal: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  cell: { width: '31.6%', flexGrow: 1, borderRadius: radius.card - 8, paddingVertical: space.m, alignItems: 'center', gap: space.xs },
});
