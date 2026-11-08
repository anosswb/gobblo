import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { tipForDay } from '@/features/toolkit/logic';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { Pet } from '@/pet/pet';
import { useAppStore } from '@/state/app-store';
import { dayKey } from '@/state/schema';
import { duration, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space, tiles, type TileColor } from '@/theme/tokens';

import { BreatheTool } from './breathe';
import { CalmTool } from './calm';
import { Button, Card, toolStyles } from './parts';
import { SitTool } from './sit';
import { TipTool } from './tip';
import { UnstickTool } from './unstick';

const t = en.tools;

export type ToolId = 'breathe' | 'calm' | 'tip' | 'unstick' | 'sit';
type Tile = { id: ToolId | 'reminders'; icon: IconName; color: TileColor; href: Href };

/** Order: what you reach for when it's hard first (stuck, stressed), then the everyday ones. */
const TILES: Tile[] = [
  { id: 'unstick', icon: 'bolt', color: 'orange', href: '/tools/unstick' },
  { id: 'breathe', icon: 'wind', color: 'teal', href: '/tools/breathe' },
  { id: 'calm', icon: 'heart', color: 'pink', href: '/tools/calm' },
  { id: 'sit', icon: 'people', color: 'indigo', href: '/tools/sit' },
  { id: 'reminders', icon: 'bell', color: 'blue', href: '/reminders' },
  { id: 'tip', icon: 'bulb', color: 'green', href: '/tools/tip' },
];

/**
 * Toolkit hub (Anass 2026-11-08): six small tools as tiles, each opens its own page.
 * Reached from the toolbox button on Home. All free: no ads, no paywall here.
 */
export function ToolkitScreen() {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const petName = useAppStore((s) => s.pet.name);
  const [tip] = useState(() => tipForDay(dayKey()));
  const enter = (i: number) => (reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast).delay(staggerDelay(i)));

  return (
    <Screen back eyebrow={t.eyebrow} title={t.title}>
      <Text variant="subhead" tone="ink2" style={toolStyles.intro}>{t.intro(petName)}</Text>

      <PressScale accessibilityRole="button" accessibilityLabel={`${t.tip.today}: ${tip.text}`} onPress={() => { haptics.select(); router.push('/tools/tip'); }}>
        <Card style={styles.hero}>
          <Pet size={76} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood="curious" />
          <View style={toolStyles.flex}>
            <Text variant="caption" tone="primary" style={styles.kicker}>{t.tip.today}</Text>
            <Text variant="subhead" numberOfLines={3}>{tip.text}</Text>
          </View>
        </Card>
      </PressScale>

      <View style={styles.grid}>
        {TILES.map((tile, i) => {
          const copy = t.tiles[tile.id];
          return (
            <Animated.View key={tile.id} entering={enter(i)} style={styles.cell}>
              <PressScale
                accessibilityRole="button"
                accessibilityLabel={`${copy.title}. ${copy.sub}`}
                onPress={() => { haptics.select(); router.push(tile.href); }}
                style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.badge, { backgroundColor: tiles[tile.color] }]}>
                  <Icon name={tile.icon} size={22} color={colors.onPrimary} />
                </View>
                <View style={styles.tileText}>
                  <Text variant="bodyBold">{copy.title}</Text>
                  <Text variant="caption" tone="ink2">{copy.sub}</Text>
                </View>
              </PressScale>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const TOOLS: Record<ToolId, () => React.JSX.Element> = {
  breathe: BreatheTool,
  calm: CalmTool,
  tip: TipTool,
  unstick: UnstickTool,
  sit: SitTool,
};

/** /tools/[tool]: one tool's page. An unknown id (old link) gets a friendly way back. */
export function ToolScreen({ id }: { id: string | undefined }) {
  const Tool = id && id in TOOLS ? TOOLS[id as ToolId] : null;
  if (Tool) return <Tool />;
  return (
    <Screen back title={t.missingTitle}>
      <Card style={toolStyles.center}>
        <Pet size={110} mood="confused" />
        <Text variant="subhead" tone="ink2">{t.missingSub}</Text>
      </Card>
      <Button label={t.back} onPress={() => router.replace('/tools')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  kicker: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  cell: { flexBasis: '46%', flexGrow: 1 },
  tile: { minHeight: 132, borderRadius: radius.card - 6, padding: space.l, gap: space.m, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'space-between' },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileText: { gap: 2 },
});
