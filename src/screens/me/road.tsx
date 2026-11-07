import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { HATS, FACES, COLORS, ROOMS } from '@/features/closet/items';
import { LEVELS, MAX_LEVEL, STAGES } from '@/features/progress/logic';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

const ALL = [...HATS, ...FACES, ...COLORS, ...ROOMS];
const STAGE_AT: Record<number, string> = Object.fromEntries(STAGES.map((s) => [s.level, s.name]));

/** The emoji that stands for a level's reward (an evolution beats an item). */
function badge(level: number): string {
  if (STAGE_AT[level] && level > 1) return '✨';
  const it = ALL.find((i) => i.unlock.type === 'level' && i.unlock.level === level);
  return it?.emoji ?? '✦';
}

/**
 * "Road to 20": every level as a stop, what it gives, and how far you are. Level 20 stays a
 * wrapped gift until you get there (the surprise is revealed by the level-up card).
 */
export function RoadTo20({ level, total }: { level: number; total: number }) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}
      contentOffset={{ x: Math.max(0, (level - 2) * 64), y: 0 }} accessibilityLabel={`Level ${level} of ${MAX_LEVEL}`}>
      {LEVELS.map((need, i) => {
        const lv = i + 1;
        const done = lv <= level;
        const now = lv === level;
        const mystery = lv === MAX_LEVEL && !done;
        return (
          <View key={lv} style={styles.stop}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: now ? colors.primary : done ? colors.primarySoft : colors.fill,
                  borderColor: now ? colors.primary : colors.cardBorder,
                },
              ]}>
              <Text style={styles.emoji}>{mystery ? '🎁' : badge(lv)}</Text>
            </View>
            <Text variant="caption" tone={now ? 'primary' : done ? 'ink' : 'ink3'}>Lv {lv}</Text>
            <Text variant="caption" tone="ink3" style={styles.need}>{done ? '✓' : `${need - total} ✦`}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.s, paddingVertical: space.xs, paddingEnd: space.l },
  stop: { width: 56, alignItems: 'center', gap: 2 },
  dot: { width: 48, height: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  emoji: { fontSize: 22, lineHeight: 28 },
  need: { fontSize: 10, lineHeight: 13 },
});
