import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Text } from '@/components/text';
import { rewardsFor, type Item, type RoomId } from '@/features/closet/items';
import { LEVELS, MAX_LEVEL, STAGES, stageOfLevel } from '@/features/progress/logic';
import { en } from '@/i18n/en';
import { Pet } from '@/pet/pet';
import type { FaceId, HatId } from '@/pet/wardrobe';
import { useTheme } from '@/theme/theme-provider';
import { roomGradients, type PetColor } from '@/theme/tokens';

const STAGE_AT: Record<number, string> = Object.fromEntries(STAGES.map((s) => [s.level, s.name]));
const TILE = 60;
const STEP = TILE + 10;

/** The one item a level shows on its tile (wearables first, then colour, then room). */
function featured(level: number): Item | undefined {
  const { items } = rewardsFor(level, STAGE_AT);
  return items.find((i) => i.slot === 'hat') ?? items.find((i) => i.slot === 'face') ?? items.find((i) => i.slot === 'color') ?? items.find((i) => i.slot === 'room');
}

/** What a level gives, read out by screen readers. */
function rewardLabel(level: number): string {
  const r = rewardsFor(level, STAGE_AT);
  return [r.stageName && level > 1 ? en.me.road.evolvesInto(r.stageName) : '', ...r.items.map((i) => i.name)].filter(Boolean).join(', ');
}

/**
 * "Road to 20" (Anass 2026-11-07: "change levels icons"): each stop now previews the real reward
 * on your own pet: the hat or glasses it wears, the new colour, the room behind it, the new
 * evolution form. Level 20 stays a wrapped gift until you get there (the level-up card reveals it).
 * All pets are `still` (20 animated pets in a row would drop frames).
 */
export function RoadTo20({ level, total, color }: { level: number; total: number; color: PetColor }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      contentOffset={{ x: Math.max(0, (level - 2) * STEP), y: 0 }}
      accessibilityLabel={en.me.road.label(level, MAX_LEVEL)}>
      {LEVELS.map((need, i) => {
        const lv = i + 1;
        const done = lv <= level;
        const now = lv === level;
        const next = lv === level + 1;
        const mystery = lv === MAX_LEVEL && !done;
        const evolves = Boolean(STAGE_AT[lv]) && lv > 1;
        const item = featured(lv);
        const stage = stageOfLevel(lv);
        const room = item?.slot === 'room' ? (item.id as Exclude<RoomId, 'auto'>) : null;
        return (
          <View key={lv} style={styles.stop} accessible accessibilityLabel={`${en.me.road.stop(lv)}${mystery ? `, ${en.me.road.surprise}` : `: ${rewardLabel(lv) || en.me.road.yourPet}`}${done ? `, ${en.me.road.unlocked}` : ''}`}>
            <View
              style={[
                styles.tile,
                {
                  backgroundColor: done ? colors.cardSolid : colors.fill,
                  borderColor: now ? colors.ink : next ? colors.ink3 : colors.cardBorder,
                  borderWidth: now ? 2 : StyleSheet.hairlineWidth,
                },
              ]}>
              {room ? <LinearGradient colors={roomGradients[room]} style={StyleSheet.absoluteFill} /> : null}
              {mystery ? (
                <Icon name="gift" size={24} color={colors.ink2} />
              ) : (
                <View style={!done && !next ? styles.dim : undefined}>
                  <Pet
                    size={room ? 34 : 40}
                    still
                    mood={evolves ? 'proud' : 'happy'}
                    stage={stage}
                    color={item?.slot === 'color' ? (item.id as PetColor) : color}
                    hat={item?.slot === 'hat' ? (item.id as HatId) : 'none'}
                    face={item?.slot === 'face' ? (item.id as FaceId) : 'none'}
                  />
                </View>
              )}
              {evolves && !mystery ? (
                <View style={[styles.badge, { backgroundColor: colors.ink }]}>
                  <Icon name="star" size={9} color={colors.bg} weight="bold" />
                </View>
              ) : null}
              {done && !now ? (
                <View style={[styles.check, { backgroundColor: colors.ink }]}>
                  <Icon name="check" size={9} color={colors.bg} weight="bold" />
                </View>
              ) : null}
            </View>
            <Text variant="caption" tone={now ? 'ink' : done ? 'ink2' : 'ink3'} style={now ? styles.bold : undefined}>{en.me.road.short(lv)}</Text>
            <Text variant="caption" tone="ink3" style={styles.need}>{done ? (now ? en.me.road.now : ' ') : en.me.road.sparksLeft(need - total)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 10, paddingVertical: 4, paddingEnd: 16 },
  stop: { width: TILE, alignItems: 'center', gap: 2 },
  tile: { width: TILE, height: TILE, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.4 },
  badge: { position: 'absolute', top: 5, start: 5, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', top: 5, end: 5, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bold: { fontWeight: '700' },
  need: { fontSize: 10, lineHeight: 13 },
});
