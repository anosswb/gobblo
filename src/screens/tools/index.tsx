import { Redirect, router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { PressScale } from '@/components/press-scale';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useLook } from '@/features/closet/use-look';
import { en } from '@/i18n/en';
import { haptics } from '@/lib/haptics';
import { play } from '@/lib/sound';
import { Pet } from '@/pet/pet';
import { SpinScreen } from '@/screens/spin';
import { useAppStore } from '@/state/app-store';
import { duration, staggerDelay } from '@/theme/motion';
import { useTheme } from '@/theme/theme-provider';
import { radius, space } from '@/theme/tokens';

import { CalmTool } from './calm';
import { Button, Card, toolStyles } from './parts';
import { UnstickTool } from './unstick';

const t = en.tools;

export type ToolId = 'unstick' | 'calm' | 'pick';
type Tile = { id: ToolId | 'reminders'; icon: IconName; href: Href };

/** Order: what you reach for when it's hard first (stuck, stressed), then the everyday ones. */
const TILES: Tile[] = [
  { id: 'unstick', icon: 'bolt', href: '/tools/unstick' },
  { id: 'calm', icon: 'heart', href: '/tools/calm' },
  { id: 'pick', icon: 'spin', href: '/tools/pick' },
  { id: 'reminders', icon: 'bell', href: '/reminders' },
];

const SIT_MINUTES = [10, 25, 45] as const;

/**
 * Toolkit hub: "Sit with me" on top (the pet works next to you in the normal focus timer, no task),
 * then four tiles. Reached from the toolbox button on Home. All free: no ads, no paywall here.
 */
export function ToolkitScreen() {
  const { colors, reduceMotion } = useTheme();
  const look = useLook();
  const petName = useAppStore((s) => s.pet.name);
  const enter = (i: number) => (reduceMotion ? FadeIn.duration(duration.quick) : FadeInDown.duration(duration.fast).delay(staggerDelay(i)));

  const sit = (minutes: number) => {
    useAppStore.getState().startFocus({ id: null, text: t.sit.task(petName), size: 1 }, minutes, 'custom');
    haptics.medium();
    play('pop');
    router.push('/focus');
  };

  return (
    <Screen back title={t.title}>
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <Pet size={76} color={look.color} stage={look.stage} hat={look.hat} face={look.face} mood="focused" working />
          <View style={toolStyles.flex}>
            <Text variant="bodyBold">{t.sit.title}</Text>
            <Text variant="subhead" tone="ink2">{t.sit.line(petName)}</Text>
          </View>
        </View>
        <View style={styles.chips}>
          {SIT_MINUTES.map((m) => (
            <PressScale
              key={m}
              accessibilityRole="button"
              accessibilityLabel={t.sit.chipLabel(m)}
              onPress={() => sit(m)}
              style={[styles.chip, { backgroundColor: colors.primarySoft }]}>
              <Text variant="bodyBold" tone="primary">{t.sit.chip(m)}</Text>
            </PressScale>
          ))}
        </View>
      </Card>

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
                <View style={[styles.badge, { backgroundColor: colors.fill }]}>
                  <Icon name={tile.icon} size={22} color={colors.ink} />
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
  unstick: UnstickTool,
  calm: CalmTool,
  pick: SpinScreen,
};

/** Pages that were merged into others: old links land on the new home of the feature. */
const MOVED: Record<string, Href> = { sit: '/tools', tip: '/tools', breathe: '/tools/calm' };

/** /tools/[tool]: one tool's page. An unknown id (old link) gets a friendly way back. */
export function ToolScreen({ id }: { id: string | undefined }) {
  if (id && id in MOVED) return <Redirect href={MOVED[id]} />;
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
  hero: { gap: space.l },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  chips: { flexDirection: 'row', gap: space.s },
  chip: { flex: 1, minHeight: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  cell: { flexBasis: '46%', flexGrow: 1 },
  tile: { minHeight: 132, borderRadius: radius.card - 6, padding: space.l, gap: space.m, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'space-between' },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileText: { gap: 2 },
});
